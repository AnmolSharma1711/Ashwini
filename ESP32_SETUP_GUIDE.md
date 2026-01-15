# ESP32 Setup Guide - Ashwini Health Monitoring System

## Overview
This guide will help you configure and connect your ESP32 to the deployed backend at https://ashwini-backend.onrender.com.

---

## Prerequisites

### Hardware Required
- ESP32 Development Board
- GY-906 MLX90614 Temperature Sensor (I2C)
- HW-827 Pulse Sensor
- 0.96" OLED Display (I2C, 128x64, SSD1306)
- Jumper wires
- USB cable for ESP32

### Software Required
- Arduino IDE (version 1.8.x or 2.x)
- Required Arduino Libraries:
  - `Adafruit_GFX`
  - `Adafruit_SSD1306`
  - `Wire` (built-in)
  - `WiFi` (built-in for ESP32)
  - `HTTPClient` (built-in for ESP32)

---

## Step 1: Hardware Connections

### I2C Devices (GY-906 & OLED Display)
| Device | ESP32 Pin |
|--------|-----------|
| SDA    | GPIO 21   |
| SCL    | GPIO 22   |
| VCC    | 3.3V      |
| GND    | GND       |

**Note**: Both GY-906 and OLED share the same I2C bus (different addresses: 0x5A and 0x3C)

### Pulse Sensor (HW-827)
| Sensor Pin | ESP32 Pin |
|------------|-----------|
| Signal (S) | GPIO 34   |
| VCC (+)    | 3.3V      |
| GND (-)    | GND       |

---

## Step 2: Install Arduino IDE & ESP32 Board Support

### Install Arduino IDE
1. Download from: https://www.arduino.cc/en/software
2. Install and launch Arduino IDE

### Add ESP32 Board Manager
1. Open Arduino IDE → File → Preferences
2. In "Additional Board Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Click OK
4. Go to Tools → Board → Boards Manager
5. Search for "esp32"
6. Install "esp32 by Espressif Systems"
7. Select your board: Tools → Board → ESP32 Arduino → "ESP32 Dev Module" (or your specific model)

---

## Step 3: Install Required Libraries

1. Open Arduino IDE → Sketch → Include Library → Manage Libraries
2. Install the following libraries:

   **Adafruit GFX Library**
   - Search: `Adafruit GFX`
   - Click Install

   **Adafruit SSD1306**
   - Search: `Adafruit SSD1306`
   - Click Install (will also install dependencies)

---

## Step 4: Register Device in Backend

### Option 1: Using Django Admin (Recommended)
1. Go to https://ashwini-backend.onrender.com/admin/
2. Login with superuser credentials (from previous setup)
3. Navigate to **Devices** section
4. Click **"Add Device"**
5. Fill in:
   - **Device ID**: `ESP32_001` (or any unique ID)
   - **Name**: `Health Monitor Station 1`
   - **Location**: `Ward A - Bed 1` (optional)
   - **Status**: Active
6. Click **Save**
7. Note down the **Device ID** - you'll need this!

### Option 2: Using API (via Postman/curl)
```bash
curl -X POST https://ashwini-backend.onrender.com/api/devices/ \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "ESP32_001",
    "name": "Health Monitor Station 1",
    "location": "Ward A - Bed 1",
    "status": "active"
  }'
```

---

## Step 5: Configure ESP32 WiFi & Credentials

1. Open `IoT-Integration/iot_integration_with_api/keys.h` in Arduino IDE
2. Update the following:

```cpp
#define secret_ssid "YOUR_WIFI_NETWORK_NAME"
#define secret_password "YOUR_WIFI_PASSWORD"
#define secret_deviceId "ESP32_001"  // Use the Device ID from Step 4
// Backend URL is already configured
#define secret_serverUrl "https://ashwini-backend.onrender.com"
```

### Example Configuration
```cpp
#define secret_ssid "MyHomeWiFi"
#define secret_password "MyWiFiP@ssw0rd!"
#define secret_deviceId "ESP32_001"
#define secret_serverUrl "https://ashwini-backend.onrender.com"
```

**Important Notes**:
- Use 2.4GHz WiFi only (ESP32 doesn't support 5GHz)
- Ensure WiFi has internet access
- No special characters in SSID that Arduino can't handle
- Device ID must match exactly what's registered in the backend

---

## Step 6: Upload Code to ESP32

1. Open `IoT-Integration/iot_integration_with_api/iot_integration_with_api.ino`
2. Connect ESP32 to computer via USB
3. Select correct port: Tools → Port → COM# (Windows) or /dev/ttyUSB# (Linux)
4. Set upload speed: Tools → Upload Speed → 115200
5. Click **Upload** button (→) in Arduino IDE
6. Wait for "Done uploading" message

---

## Step 7: Monitor Serial Output

1. Open Serial Monitor: Tools → Serial Monitor
2. Set baud rate to **115200**
3. You should see:

```
╔════════════════════════════════════════╗
║   ESP32 Health Monitor System v1.0    ║
║   Temperature + Heart Rate → Django   ║
╚════════════════════════════════════════╝

📡 API Measurement: https://ashwini-backend.onrender.com/api/devices/ESP32_001/measurements/
📡 API Command: https://ashwini-backend.onrender.com/api/devices/ESP32_001/command/

🌐 Connecting to WiFi...
✅ WiFi Connected!
📶 IP Address: 192.168.1.XXX
📶 Signal: -45 dBm

🔍 Initializing sensors...
✅ Temperature sensor: OK
✅ Heart rate sensor: OK
✅ Display: Ready

🚀 System Ready! Waiting for measurement commands...
```

---

## Step 8: Test Device Communication

### Check Device Connection
1. Go to https://ashwini-backend.onrender.com/api/devices/
2. Verify your ESP32_001 device is listed
3. Check `last_seen` timestamp updates when ESP32 polls for commands

### View Device Details
Visit: `https://ashwini-backend.onrender.com/api/devices/ESP32_001/`

Expected response:
```json
{
  "device_id": "ESP32_001",
  "name": "Health Monitor Station 1",
  "location": "Ward A - Bed 1",
  "status": "active",
  "last_seen": "2026-01-15T10:30:00Z"
}
```

---

## Step 9: Start Measurement Session

### Create a Patient (if not exists)
1. Go to Frontend Main: https://ashwini-frontend-main.vercel.app
2. Register a new patient:
   - Name: Test Patient
   - Age: 25
   - Gender: Male
   - MRN: MRN001
   - Contact: 1234567890

### Start Measurement from Frontend
1. In the "Health Monitoring Station" section
2. Select Patient MRN: MRN001
3. Select Device: ESP32_001
4. Click **"Start Measurement"**

### What Happens on ESP32
- Serial Monitor will show:
  ```
  📥 Command received: start_measurement
  👤 Patient ID: 1
  📊 Session ID: 1
  🟢 Measurement started!
  ```
- OLED Display will show live readings
- Data will be sent to backend every 10 seconds

### View Real-Time Data
1. Go to Frontend Unified: https://ashwini-unified-view.vercel.app
2. Select Patient: MRN001
3. See live temperature and heart rate graphs updating

---

## Troubleshooting

### Issue: WiFi Won't Connect
**Symptoms**: Serial shows "Connecting..." repeatedly
**Solutions**:
- Verify SSID and password in `keys.h`
- Check WiFi is 2.4GHz (not 5GHz)
- Ensure WiFi network has internet access
- Move ESP32 closer to router

### Issue: Sensor Not Detected
**Symptoms**: Serial shows "Temperature sensor: FAIL"
**Solutions**:
- Check I2C wiring (SDA=21, SCL=22)
- Verify sensor address (GY-906 should be 0x5A)
- Run I2C scanner sketch to detect devices
- Check 3.3V power supply is stable

### Issue: API Errors (HTTP 4xx/5xx)
**Symptoms**: Serial shows "❌ HTTP Error: 404" or "500"
**Solutions**:
- Verify Device ID matches backend registration
- Check backend is accessible: curl https://ashwini-backend.onrender.com/
- Wait 30 seconds if backend is "cold starting" (Render free tier)
- Check Render logs for backend errors

### Issue: "Device Not Found" Error
**Symptoms**: HTTP 404 when polling for commands
**Solutions**:
- Verify device is registered in Django Admin
- Check device_id in `keys.h` matches exactly (case-sensitive)
- Re-register device if needed

### Issue: Data Not Appearing in Frontend
**Symptoms**: ESP32 sends data, but graphs show nothing
**Solutions**:
- Ensure measurement session is active (status = "active")
- Check CORS settings on Render include Vercel URLs
- Verify patient_id and session_id are correct in ESP32 output
- Check browser console for API errors

---

## ESP32 Operating Modes

### Idle Mode
- **Status**: Waiting for start command
- **Display**: Shows "Waiting for command..."
- **Behavior**: Polls backend every 2 seconds for commands

### Active Measurement Mode
- **Status**: Recording and sending data
- **Display**: Live temperature and heart rate
- **Behavior**: 
  - Updates display every 500ms
  - Sends data to backend every 10 seconds
  - Continues until "stop_measurement" command received

### Stop Measurement
Send from frontend or manually via API:
```bash
curl -X POST https://ashwini-backend.onrender.com/api/devices/ESP32_001/command/ \
  -H "Content-Type: application/json" \
  -d '{"command": "stop_measurement"}'
```

---

## LED Indicators (if available on your ESP32)

| LED Status | Meaning |
|------------|---------|
| Blinking Fast | Connecting to WiFi |
| Solid On | WiFi Connected |
| Blinking Slow | Sending data to backend |
| Off | Device in low power mode |

---

## Serial Monitor Commands Reference

### Useful Debug Output
```
📶 WiFi Status: Connected / Disconnected
🌡️ Temp: 36.5°C (Ambient: 25.2°C)
❤️ Heart Rate: 75 BPM
📤 Sending data... ✅ Success! (Response: 201)
📥 Polling commands... ✅ Command: start_measurement
⚠️ Warning: Sensor read failed, retrying...
❌ HTTP Error: 500 - Server error
```

---

## Advanced Configuration

### Modify Data Send Interval
In `iot_integration_with_api.ino`, change:
```cpp
const unsigned long apiInterval = 10000; // 10 seconds (default)
// Change to 5000 for 5 seconds, 30000 for 30 seconds
```

### Modify Command Poll Interval
```cpp
const unsigned long commandPollInterval = 2000; // 2 seconds (default)
```

### Calibrate Heart Rate Sensor
Adjust baseline threshold:
```cpp
int baseline = 170; // Increase if too sensitive, decrease if not detecting
```

---

## Testing Checklist

- [ ] ESP32 powers on and connects to WiFi
- [ ] Serial Monitor shows "System Ready!"
- [ ] Device appears in backend API: `/api/devices/ESP32_001/`
- [ ] OLED display shows sensor readings
- [ ] Temperature sensor reads correctly (~25°C ambient)
- [ ] Heart rate sensor detects pulse (60-100 BPM when finger placed)
- [ ] Backend receives data when measurement started
- [ ] Frontend graphs update with live data
- [ ] Stop command successfully halts measurement

---

## Support & Debugging

### Get Device Status
```bash
curl https://ashwini-backend.onrender.com/api/devices/ESP32_001/
```

### Get Recent Measurements
```bash
curl https://ashwini-backend.onrender.com/api/measurements/?device=ESP32_001
```

### Send Manual Command
```bash
curl -X POST https://ashwini-backend.onrender.com/api/devices/ESP32_001/command/ \
  -H "Content-Type: application/json" \
  -d '{"command": "stop_measurement"}'
```

### Check Backend Logs
- Go to Render Dashboard
- Select "ashwini-backend" service
- Click "Logs" tab
- Look for ESP32_001 related entries

---

## Next Steps

1. ✅ Complete hardware assembly
2. ✅ Upload code to ESP32
3. ✅ Register device in backend
4. ✅ Test measurement session
5. ✅ Monitor data flow in frontend
6. 🎯 Deploy multiple ESP32 devices for different wards
7. 🎯 Set up alerts for abnormal readings
8. 🎯 Add more sensors (SpO2, ECG, etc.)

---

## Quick Reference Card

| Item | Value |
|------|-------|
| Backend URL | https://ashwini-backend.onrender.com |
| Frontend Main | https://ashwini-frontend-main.vercel.app |
| Frontend Unified | https://ashwini-unified-view.vercel.app |
| Device API | /api/devices/{device_id}/ |
| Measurement API | /api/devices/{device_id}/measurements/ |
| Command API | /api/devices/{device_id}/command/ |
| I2C SDA Pin | GPIO 21 |
| I2C SCL Pin | GPIO 22 |
| Pulse Sensor | GPIO 34 |
| Serial Baud Rate | 115200 |
| WiFi Type | 2.4GHz only |

---

**✅ Your ESP32 is now ready to connect to the Ashwini Health Monitoring System!**

If you encounter any issues, check the Serial Monitor output first - it provides detailed diagnostic information.
