#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "secrets.h" //Changes this line to include secrets.h to keys.h

// ==================== Globla variable confinguration CONFIGURATION ====================
// =================== Fill these keys for device implementation ====================
// WiFi Credentials
const char* ssid = secret_ssid;
const char* password = secret_password;

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

// ==================== TEMPERATURE SENSOR (GY-906) ====================
#define MLX90614_I2CADDR 0x5A
#define MLX90614_TOBJ1 0x07
#define MLX90614_TAMB 0x06

float lastAmbient = 25.0;
float lastObject = 25.0;

// ==================== HEART RATE SENSOR (HW-827) ====================
#define HEART_SENSOR_PIN 34

// Heart rate detection variables
int baseline = 170;
int lastValue = 0;
unsigned long lastBeatTime = 0;
int bpm = 0;
int validBpmCount = 0;
float bpmSum = 0;
int avgBpm = 0;

// Moving average for heart rate smoothing
const int numReadings = 20;
int readings[numReadings];
int readIndex = 0;
int total = 0;
int average = 0;

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

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║   ESP32 Health Monitor System v1.0    ║");
  Serial.println("║   Temperature + Heart Rate → Django   ║");
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
  Wire.setClock(50000); // Slower I2C for stability
  
  // Initialize OLED Display
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println("❌ OLED Display FAILED!");
    while(1);
  }
  Serial.println("✓ OLED Display initialized");
  
  // Welcome screen
  displayWelcome();
  delay(2000);
  
  // Check Temperature Sensor
  Wire.beginTransmission(MLX90614_I2CADDR);
  if (Wire.endTransmission() == 0) {
    Serial.println("✓ GY-906 Temperature Sensor found");
    sensorReady = true;
  } else {
    Serial.println("⚠ GY-906 NOT found - check wiring!");
    sensorReady = false;
  }
  
  // Initialize Heart Rate Sensor
  pinMode(HEART_SENSOR_PIN, INPUT);
  for (int i = 0; i < numReadings; i++) {
    readings[i] = 0;
  }
  
  // Calibrate heart rate sensor baseline
  Serial.println("⏳ Calibrating heart rate sensor...");
  calibrateHeartSensor();
  Serial.print("✓ Heart rate baseline: ");
  Serial.println(baseline);
  
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
    // Read sensors
    float ambientTemp = readAmbientTemp();
    float objectTemp = readObjectTemp();
    int currentBpm = readHeartRate();
    
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
      updateDisplay(lastAmbient, lastObject, avgBpm);
      lastDisplay = millis();
    }
    
    // Send measurement data immediately (wait 3 seconds for stable readings)
    if (millis() - lastApiSend > 3000) {
      if (WiFi.status() == WL_CONNECTED) {
        sendToDjango(lastAmbient, lastObject, avgBpm);
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
  displayStatus("Connecting WiFi...");
  
  Serial.print("Connecting to: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("✓ WiFi Connected!");
    Serial.print("  IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("  Signal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    
    displayStatus("WiFi Connected!");
    delay(1500);
  } else {
    wifiConnected = false;
    Serial.println("❌ WiFi Connection FAILED!");
    displayStatus("WiFi Failed!");
    delay(2000);
  }
}

// ==================== TEMPERATURE SENSOR ====================
float readAmbientTemp() {
  Wire.beginTransmission(MLX90614_I2CADDR);
  if (Wire.endTransmission() != 0) return -999;
  
  delay(10);
  
  Wire.beginTransmission(MLX90614_I2CADDR);
  Wire.write(MLX90614_TAMB);
  if (Wire.endTransmission(false) != 0) return -999;
  
  if (Wire.requestFrom(MLX90614_I2CADDR, 3) != 3) return -999;
  
  uint16_t data = Wire.read();
  data |= Wire.read() << 8;
  Wire.read(); // CRC
  
  if (data == 0x0000 || data == 0xFFFF) return -999;
  
  return data * 0.02 - 273.15;
}

float readObjectTemp() {
  Wire.beginTransmission(MLX90614_I2CADDR);
  if (Wire.endTransmission() != 0) return -999;
  
  delay(10);
  
  Wire.beginTransmission(MLX90614_I2CADDR);
  Wire.write(MLX90614_TOBJ1);
  if (Wire.endTransmission(false) != 0) return -999;
  
  if (Wire.requestFrom(MLX90614_I2CADDR, 3) != 3) return -999;
  
  uint16_t data = Wire.read();
  data |= Wire.read() << 8;
  Wire.read(); // CRC
  
  if (data == 0x0000 || data == 0xFFFF) return -999;
  
  return data * 0.02 - 273.15;
}

// ==================== HEART RATE SENSOR ====================
void calibrateHeartSensor() {
  int sum = 0;
  for (int i = 0; i < 100; i++) {
    sum += analogRead(HEART_SENSOR_PIN);
    delay(20);
  }
  baseline = sum / 100;
}

int readHeartRate() {
  int rawValue = analogRead(HEART_SENSOR_PIN);
  
  // Moving average smoothing
  total = total - readings[readIndex];
  readings[readIndex] = rawValue;
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % numReadings;
  average = total / numReadings;
  
  // Peak detection
  static bool isPeak = false;
  static int lastAverage = baseline;
  int threshold = 10; // Increased threshold for noisy sensor
  
  // Detect rising edge (heartbeat)
  if (average > lastAverage + threshold && !isPeak) {
    if (average > baseline + threshold) {
      isPeak = true;
      
      unsigned long currentTime = millis();
      
      if (lastBeatTime != 0) {
        unsigned long timeDiff = currentTime - lastBeatTime;
        
        // Valid heart rate: 40-180 BPM (more permissive range)
        if (timeDiff > 333 && timeDiff < 2000) {
          int calculatedBpm = 60000 / timeDiff;
          
          // Average last 5 valid readings for stability
          bpmSum += calculatedBpm;
          validBpmCount++;
          
          if (validBpmCount >= 5) {
            avgBpm = bpmSum / validBpmCount;
            bpmSum = 0;
            validBpmCount = 0;
            
            Serial.print("♥ Beat detected! BPM: ");
            Serial.println(avgBpm);
          }
        }
      }
      
      lastBeatTime = currentTime;
    }
  }
  
  // Falling edge - reset peak detection
  if (average < lastAverage - threshold) {
    isPeak = false;
  }
  
  lastAverage = average;
  
  return avgBpm;
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
      
      displayStatus("Measuring...");
    } else if (response.indexOf("\"idle\"") > 0) {
      // No measurement needed - device is idle
    }
  }
  
  http.end();
}

void sendToDjango(float ambient, float object, int heartRate) {
  HTTPClient http;
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║      Sending Data to Django API       ║");
  Serial.println("╚════════════════════════════════════════╝");
  
  http.begin(apiMeasurementEndpoint);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload for Ashwini API
  // Format: POST /api/devices/<device_id>/measurements/
  String jsonPayload = "{";
  jsonPayload += "\"patient_id\":" + String(currentPatientId) + ",";
  jsonPayload += "\"temperature\":" + String(object, 1) + ",";
  jsonPayload += "\"heart_rate\":" + String(heartRate);
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
      
      displayApiStatus("API: OK!", true);
    } else {
      Serial.println("⚠ API Error!");
      apiFailCount++;
      lastApiStatus = "Error " + String(httpCode);
      
      displayApiStatus("API: Error", false);
    }
  } else {
    Serial.print("❌ Connection Error: ");
    Serial.println(http.errorToString(httpCode));
    apiFailCount++;
    lastApiStatus = "Failed";
    
    displayApiStatus("API: Failed", false);
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
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(15, 10);
  display.println("ESP32 Health");
  display.setCursor(25, 25);
  display.println("Monitor");
  display.setCursor(30, 45);
  display.println("System v1.0");
  
  display.display();
}

void displayStatus(String message) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(10, 28);
  display.println(message);
  display.display();
}

void updateDisplay(float ambient, float object, int heartRate) {
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
  
  // Room Temperature
  display.setTextSize(1);
  display.setCursor(0, 14);
  display.println("Room:");
  display.setTextSize(1);
  display.setCursor(45, 14);
  display.print(ambient, 1);
  display.println("C");
  
  // Body Temperature
  display.setTextSize(1);
  display.setCursor(0, 28);
  display.println("Body:");
  display.setTextSize(2);
  display.setCursor(45, 24);
  display.print(object, 1);
  display.setTextSize(1);
  display.println("C");
  
  // Heart Rate
  display.setTextSize(1);
  display.setCursor(0, 45);
  display.print("Heart:");
  display.setTextSize(2);
  display.setCursor(45, 41);
  if (heartRate > 0) {
    display.print(heartRate);
  } else {
    display.print("--");
  }
  display.setTextSize(1);
  display.println("bpm");
  
  // Status bar at bottom
  display.setTextSize(1);
  display.setCursor(0, 56);
  display.println(lastApiStatus);
  
  display.display();
}

void displayIdle() {
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
  display.fillRect(0, SCREEN_HEIGHT - 10, SCREEN_WIDTH, 10, SSD1306_BLACK);
  display.setTextSize(1);
  display.setCursor(0, SCREEN_HEIGHT - 9);
  display.println(message);
  display.display();
  delay(1500);
}