/**
 * Keep-Alive Service
 * Pings the backend periodically to prevent Render free tier from sleeping
 * 
 * Usage: Import and call startKeepAlive() when your app initializes
 */

const BACKEND_URL = process.env.REACT_APP_API_URL || 'https://your-render-app.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

let keepAliveInterval = null;

/**
 * Ping the backend health endpoint
 */
const pingBackend = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('Backend keep-alive ping successful');
    } else {
      console.warn('Backend keep-alive ping returned non-OK status:', response.status);
    }
  } catch (error) {
    console.error('Backend keep-alive ping failed:', error.message);
  }
};

/**
 * Start the keep-alive service
 * Call this when your app initializes
 */
export const startKeepAlive = () => {
  if (keepAliveInterval) {
    console.warn('Keep-alive service already running');
    return;
  }
  
  // Initial ping
  pingBackend();
  
  // Set up periodic pings
  keepAliveInterval = setInterval(pingBackend, PING_INTERVAL);
  console.log(`Keep-alive service started (pinging every ${PING_INTERVAL / 1000 / 60} minutes)`);
};

/**
 * Stop the keep-alive service
 */
export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('Keep-alive service stopped');
  }
};

/**
 * Check if keep-alive service is running
 */
export const isKeepAliveRunning = () => {
  return keepAliveInterval !== null;
};

export default {
  startKeepAlive,
  stopKeepAlive,
  isKeepAliveRunning,
  pingBackend,
};
