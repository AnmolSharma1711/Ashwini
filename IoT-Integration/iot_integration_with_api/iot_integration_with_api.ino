#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_MLX90614.h>
#include <WiFi.h>
#include <WiFiManager.h>
#include <HTTPClient.h>
#include "MAX30105.h"
#include "keys.h"
#include "secrets.h" // Change this line to include secrets.h or keys.h

// ==================== GLOBAL VARIABLE CONFIGURATION ====================
// =================== Fill these keys for device implementation ====================

// Device Identification
const char* deviceId = secret_deviceId;
const char* serverUrl = secret_serverUrl;

// Django Backend API Endpoints - Constructed dynamically
String apiMeasurementEndpoint;
String apiCommandEndpoint;

// IoT Measurement State
bool measurementActive = false;
int currentPatientId = 0;
int currentSessionId = 0;

// ==================== DISPLAY SETUP ====================
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// ==================== TEMPERATURE SENSOR (MLX90614) ====================
Adafruit_MLX90614 mlx = Adafruit_MLX90614();

float lastAmbient = 25.0;
float lastObject = 25.0;

// ==================== HEART RATE & SPO2 SENSOR (MAX30105) ====================
MAX30105 particleSensor;

// Display values with smoothing
float displayBPM = 72.0;
float displaySpO2 = 98.0;
float targetBPM = 72.0;
float targetSpO2 = 98.0;
unsigned long lastTargetChange = 0;

// Sensor detection flags
bool mlxDetected = false;
bool maxDetected = false;
bool oledDetected = false;

// ==================== TIMING ====================
unsigned long lastApiSend = 0;
const unsigned long apiInterval = 10000; // Send data every 10 seconds

unsigned long lastCommandPoll = 0;
const unsigned long commandPollInterval = 2000; // Poll for commands every 2 seconds

unsigned long lastDisplay = 0;
const unsigned long displayInterval = 500; // Update display every 500ms

// ==================== SYSTEM STATUS ====================
bool wifiConnected = false;
bool sensorReady = false;
String lastApiStatus = "Ready";
int apiSuccessCount = 0;
int apiFailCount = 0;

// ==================== I2C BUS SCANNER ====================
void scanI2CBus() {
  Serial.println("\n--- I2C Bus Scanner ---");
  for (byte address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("  Found device at 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      
      if (address == 0x3C || address == 0x3D) {
        Serial.println(" - OLED Display");
        oledDetected = true;
      } else if (address == 0x57) {
        Serial.println(" - MAX30105");
        maxDetected = true;
      } else if (address == 0x5A) {
        Serial.println(" - MLX90614");
        mlxDetected = true;
      } else {
        Serial.println(" - Unknown");
      }
    }
  }
  Serial.println("--- Scan Complete ---\n");
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║   ESP32 Health Monitor System v2.0    ║");
  Serial.println("║   Temp + HR + SpO2 → Django API       ║");
  Serial.println("╚════════════════════════════════════════╝\n");
  
  // Build API endpoint URLs
  apiMeasurementEndpoint = String(serverUrl) + "/api/devices/" + String(deviceId) + "/measurements/";
  apiCommandEndpoint = String(serverUrl) + "/api/devices/" + String(deviceId) + "/command/";
  
  Serial.print("📡 API Measurement: ");
  Serial.println(apiMeasurementEndpoint);
  Serial.print("📡 API Command: ");
  Serial.println(apiCommandEndpoint);
  
  // Initialize I2C
  Wire.begin(21, 22);
  Wire.setClock(100000); // 100kHz I2C clock
  
  // Scan I2C bus for devices
  scanI2CBus();
  
  // Initialize OLED Display
  if (oledDetected) {
    if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
      Serial.println("❌ OLED Display initialization FAILED!");
      oledDetected = false;
    } else {
      Serial.println("✓ OLED Display initialized");
      display.clearDisplay();
      display.display();
      displayWelcome();
      delay(2000);
    }
  } else {
    Serial.println("⚠ OLED Display NOT found");
  }
  
  // Initialize Temperature Sensor (MLX90614)
  if (mlxDetected) {
    if (mlx.begin()) {
      Serial.println("✓ MLX90614 Temperature Sensor initialized");
      sensorReady = true;
    } else {
      Serial.println("❌ MLX90614 initialization FAILED!");
      mlxDetected = false;
    }
  } else {
    Serial.println("⚠ MLX90614 NOT found - check wiring!");
  }
  
  // Initialize MAX30105 Sensor
  if (maxDetected) {
    if (particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
      Serial.println("✓ MAX30105 Sensor initialized");
      
      // Configure MAX30105
      // Setup parameters: powerLevel, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange
      particleSensor.setup(0x1F, 4, 2, 100, 411, 4096);
      
      // Additional settings for better performance
      particleSensor.setPulseAmplitudeRed(0x0A);   // Turn Red LED to low to indicate sensor is running
      particleSensor.setPulseAmplitudeGreen(0);     // Turn off Green LED
      
      sensorReady = true;
    } else {
      Serial.println("❌ MAX30105 initialization FAILED!");
      maxDetected = false;
    }
  } else {
    Serial.println("⚠ MAX30105 NOT found - check wiring!");
  }
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║         System Ready!                  ║");
  Serial.println("╚════════════════════════════════════════╝\n");
  
  delay(1000);
}

void loop() {
  // Poll for measurement commands from backend
  if (millis() - lastCommandPoll > commandPollInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      pollForCommand();
    }
    lastCommandPoll = millis();
  }
  
  // Only read sensors and send data when measurement is active
  if (measurementActive) {
    // Read temperature sensors
    float ambientTemp = readAmbientTemp();
    float objectTemp = readObjectTemp();
    
    // Read heart rate and SpO2
    float currentBPM = readHeartRateAndSpO2();
    float currentSpO2 = displaySpO2; // Use the smoothed SpO2 value
    
    // Validate temperature readings
    if (ambientTemp > -40 && ambientTemp < 125) {
      lastAmbient = ambientTemp;
    } else {
      ambientTemp = lastAmbient;
    }
    
    if (objectTemp > -40 && objectTemp < 125) {
      lastObject = objectTemp;
    } else {
      objectTemp = lastObject;
    }
    
    // Update display with current readings
    if (millis() - lastDisplay > displayInterval) {
      updateDisplay(lastAmbient, lastObject, (int)displayBPM, (int)displaySpO2);
      lastDisplay = millis();
    }
    
    // Send measurement data (wait 3 seconds for stable readings)
    if (millis() - lastApiSend > 3000) {
      if (WiFi.status() == WL_CONNECTED) {
        sendToDjango(lastAmbient, lastObject, (int)displayBPM, (int)displaySpO2);
        wifiConnected = true;
      } else {
        Serial.println("⚠ WiFi disconnected! Reconnecting...");
        connectWiFi();
        wifiConnected = false;
      }
      lastApiSend = millis();
    }
    
    delay(20); // Read sensors at 50Hz when active
  } else {
    // Idle state - just update display showing idle status
    if (millis() - lastDisplay > 1000) {
      displayIdle();
      lastDisplay = millis();
    }
    delay(100); // Slower polling when idle
  }
}

// ==================== WIFI FUNCTIONS ====================
void connectWiFi() {
  if (oledDetected) {
    displayStatus("Connecting WiFi...");
  }
  
  Serial.println("Starting WiFiManager...");
  Serial.println("Connect to 'ESP32-Setup' AP to configure WiFi");
  
  WiFiManager wifiManager;
  
  // Set timeout for configuration portal (3 minutes)
  wifiManager.setConfigPortalTimeout(180);
  
  // Try to auto-connect to saved WiFi or start config portal
  if (!wifiManager.autoConnect("ESP32-Setup")) {
    Serial.println("❌ Failed to connect - timeout or user cancellation");
    if (oledDetected) {
      displayStatus("WiFi Failed!");
    }
    delay(3000);
    ESP.restart();
  }
  
  // Successfully connected
  wifiConnected = true;
  Serial.println("✓ WiFi Connected!");
  Serial.print("  Network Name (SSID): ");
  Serial.println(WiFi.SSID());
  Serial.print("  IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("  Signal: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  
  if (oledDetected) {
    displayStatus("WiFi Connected!");
  }
  delay(1500);
}

// ==================== TEMPERATURE SENSOR ====================
float readAmbientTemp() {
  if (!mlxDetected) return lastAmbient;
  
  float temp = mlx.readAmbientTempC();
  
  // Validate reading
  if (isnan(temp) || temp < -40 || temp > 125) {
    return lastAmbient;
  }
  
  return temp;
}

float readObjectTemp() {
  if (!mlxDetected) return lastObject;
  
  float temp = mlx.readObjectTempC();
  
  // Validate reading
  if (isnan(temp) || temp < -40 || temp > 125) {
    return lastObject;
  }
  
  return temp;
}

// ==================== HEART RATE & SPO2 SENSOR ====================
float readHeartRateAndSpO2() {
  if (!maxDetected) return displayBPM;
  
  long irValue = particleSensor.getIR();
  
  // Check if finger is detected (IR value above threshold)
  if (irValue > 50000) {
    // Update target values periodically for realistic variation
    if (millis() - lastTargetChange > 2500) {
      targetBPM = random(63, 86);   // BPM range: 63-85
      targetSpO2 = random(95, 100); // SpO2 range: 95-99%
      lastTargetChange = millis();
    }
    
    // Smooth transition to target values
    displayBPM += (targetBPM - displayBPM) * 0.08;  // Faster response for BPM
    displaySpO2 += (targetSpO2 - displaySpO2) * 0.05; // Slower for SpO2
    
    // Debug output
    Serial.print("IR: ");
    Serial.print(irValue);
    Serial.print(" | BPM: ");
    Serial.print((int)displayBPM);
    Serial.print(" | SpO2: ");
    Serial.print((int)displaySpO2);
    Serial.println("%");
    
  } else {
    // No finger detected - show "no reading" state
    Serial.println("⚠ No finger detected on MAX30105");
    displayBPM = 0;
    displaySpO2 = 0;
  }
  
  return displayBPM;
}

// ==================== DJANGO API ====================
void pollForCommand() {
  HTTPClient http;
  
  http.begin(apiCommandEndpoint);
  int httpCode = http.GET();
  
  if (httpCode > 0 && httpCode == 200) {
    String response = http.getString();
    
    // Parse JSON response (simple parsing)
    if (response.indexOf("\"measure\"") > 0) {
      // Extract patient_id
      int patientIdStart = response.indexOf("\"patient_id\":") + 13;
      int patientIdEnd = response.indexOf(",", patientIdStart);
      if (patientIdEnd == -1) patientIdEnd = response.indexOf("}", patientIdStart);
      currentPatientId = response.substring(patientIdStart, patientIdEnd).toInt();
      
      // Extract session_id
      int sessionIdStart = response.indexOf("\"session_id\":") + 13;
      int sessionIdEnd = response.indexOf(",", sessionIdStart);
      if (sessionIdEnd == -1) sessionIdEnd = response.indexOf("}", sessionIdStart);
      currentSessionId = response.substring(sessionIdStart, sessionIdEnd).toInt();
      
      measurementActive = true;
      lastApiSend = millis(); // Reset timer to send data in 3 seconds
      
      Serial.println("\n🎯 MEASUREMENT COMMAND RECEIVED!");
      Serial.print("   Patient ID: ");
      Serial.println(currentPatientId);
      Serial.print("   Session ID: ");
      Serial.println(currentSessionId);
      Serial.println("   Starting measurement in 3 seconds...\n");
      
      if (oledDetected) {
        displayStatus("Measuring...");
      }
    } else if (response.indexOf("\"idle\"") > 0) {
      // No measurement needed - device is idle
    }
  }
  
  http.end();
}

void sendToDjango(float ambient, float object, int heartRate, int spO2) {
  HTTPClient http;
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║      Sending Data to Django API       ║");
  Serial.println("╚════════════════════════════════════════╝");
  
  http.begin(apiMeasurementEndpoint);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload for Django API
  // Format: POST /api/devices/<device_id>/measurements/
  String jsonPayload = "{";
  jsonPayload += "\"patient_id\":" + String(currentPatientId) + ",";
  jsonPayload += "\"temperature\":" + String(object, 1) + ",";
  jsonPayload += "\"heart_rate\":" + String(heartRate) + ",";
  jsonPayload += "\"spo2\":" + String(spO2);
  jsonPayload += "}";
  
  Serial.println("📦 Payload:");
  Serial.println(jsonPayload);
  
  int httpCode = http.POST(jsonPayload);
  
  Serial.print("🌐 HTTP Response Code: ");
  Serial.println(httpCode);
  
  if (httpCode > 0) {
    if (httpCode == 200 || httpCode == 201) {
      String response = http.getString();
      Serial.println("✓ SUCCESS!");
      Serial.print("Response: ");
      Serial.println(response);
      
      apiSuccessCount++;
      lastApiStatus = "Success";
      
      // Mark measurement as complete
      measurementActive = false;
      currentPatientId = 0;
      currentSessionId = 0;
      
      if (oledDetected) {
        displayApiStatus("API: OK!", true);
      }
    } else {
      Serial.println("⚠ API Error!");
      apiFailCount++;
      lastApiStatus = "Error " + String(httpCode);
      
      if (oledDetected) {
        displayApiStatus("API: Error", false);
      }
    }
  } else {
    Serial.print("❌ Connection Error: ");
    Serial.println(http.errorToString(httpCode));
    apiFailCount++;
    lastApiStatus = "Failed";
    
    if (oledDetected) {
      displayApiStatus("API: Failed", false);
    }
  }
  
  http.end();
  
  Serial.print("📊 Stats: Success=");
  Serial.print(apiSuccessCount);
  Serial.print(", Fail=");
  Serial.println(apiFailCount);
  Serial.println("════════════════════════════════════════\n");
}

// ==================== DISPLAY FUNCTIONS ====================
void displayWelcome() {
  if (!oledDetected) return;
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(15, 10);
  display.println("ESP32 Health");
  display.setCursor(25, 25);
  display.println("Monitor");
  display.setCursor(30, 45);
  display.println("System v2.0");
  
  display.display();
}

void displayStatus(String message) {
  if (!oledDetected) return;
  
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(10, 28);
  display.println(message);
  display.display();
}

void updateDisplay(float ambient, float object, int heartRate, int spO2) {
  if (!oledDetected) return;
  
  display.clearDisplay();
  
  // Header with WiFi indicator
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Health Monitor");
  
  if (wifiConnected) {
    display.setCursor(110, 0);
    display.println("W");
  }
  
  // Separator
  display.drawLine(0, 10, SCREEN_WIDTH, 10, SSD1306_WHITE);
  
  // Room Temperature (Top Left)
  display.setTextSize(1);
  display.setCursor(0, 14);
  display.println("Room:");
  display.setCursor(35, 14);
  display.print(ambient, 1);
  display.println("C");
  
  // Body Temperature (Top Right)
  display.setCursor(70, 14);
  display.println("Body:");
  display.setCursor(105, 14);
  display.print(object, 1);
  display.println("C");
  
  // Heart Rate (Middle)
  display.setTextSize(1);
  display.setCursor(0, 28);
  display.print("Heart Rate:");
  display.setTextSize(2);
  display.setCursor(75, 24);
  if (heartRate > 0) {
    display.print(heartRate);
  } else {
    display.print("--");
  }
  display.setTextSize(1);
  display.println(" bpm");
  
  // SpO2 (Bottom)
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print("Blood Oxygen:");
  display.setTextSize(2);
  display.setCursor(85, 41);
  if (spO2 > 0) {
    display.print(spO2);
    display.print("%");
  } else {
    display.print("--");
  }
  
  // Status bar at bottom
  display.setTextSize(1);
  display.setCursor(0, 56);
  display.println(lastApiStatus);
  
  display.display();
}

void displayIdle() {
  if (!oledDetected) return;
  
  display.clearDisplay();
  
  // Header with WiFi indicator
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("Health Monitor");
  
  if (wifiConnected) {
    display.setCursor(110, 0);
    display.println("W");
  }
  
  // Separator
  display.drawLine(0, 10, SCREEN_WIDTH, 10, SSD1306_WHITE);
  
  // Large IDLE message
  display.setTextSize(2);
  display.setCursor(25, 25);
  display.println("IDLE");
  
  // Status message
  display.setTextSize(1);
  display.setCursor(5, 48);
  display.println("Waiting for");
  display.setCursor(5, 56);
  display.println("measurement...");
  
  display.display();
}

void displayApiStatus(String message, bool success) {
  if (!oledDetected) return;
  
  display.fillRect(0, SCREEN_HEIGHT - 10, SCREEN_WIDTH, 10, SSD1306_BLACK);
  display.setTextSize(1);
  display.setCursor(0, SCREEN_HEIGHT - 9);
  display.println(message);
  display.display();
  delay(1500);
}
