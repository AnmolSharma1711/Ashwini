#!/usr/bin/env python3
"""
Backend Keep-Alive Script
Pings the Render backend every 10 minutes to prevent it from sleeping

Usage:
    python keep_alive.py

Or run in background:
    nohup python keep_alive.py &
"""

import requests
import time
from datetime import datetime

# Configuration
BACKEND_URL = "https://your-render-app-name.onrender.com"
HEALTH_ENDPOINT = f"{BACKEND_URL}/api/health/"
PING_INTERVAL = 600  # 10 minutes in seconds

def ping_backend():
    """Ping the backend health endpoint"""
    try:
        response = requests.get(HEALTH_ENDPOINT, timeout=30)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        if response.status_code == 200:
            print(f"[{timestamp}] ✓ Backend is alive (status: {response.status_code})")
            return True
        else:
            print(f"[{timestamp}] ⚠ Backend responded with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] ✗ Failed to ping backend: {str(e)}")
        return False

def main():
    """Main keep-alive loop"""
    print("=" * 60)
    print("Backend Keep-Alive Service Started")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Ping interval: {PING_INTERVAL} seconds ({PING_INTERVAL // 60} minutes)")
    print("=" * 60)
    print()
    
    # Initial ping
    ping_backend()
    
    # Continuous ping loop
    try:
        while True:
            time.sleep(PING_INTERVAL)
            ping_backend()
    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print("Keep-Alive Service Stopped")
        print("=" * 60)

if __name__ == "__main__":
    main()
