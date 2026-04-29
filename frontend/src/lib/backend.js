/**
 * Dynamic backend URL resolution for Brian.
 *
 * In the Tauri desktop app, the Python sidecar picks a free port and writes
 * it to ~/.brian/port. The Rust shell reads that file and emits the port
 * via the `backend-ready` event. This module stores the resolved port so
 * all API calls use the correct URL.
 *
 * In browser dev mode (no Tauri), falls back to VITE_API_URL env var or
 * localhost:8080.
 */

let _port = null;
let _baseUrl = null;

/**
 * Set the backend port (called when `backend-ready` event fires).
 */
export function setBackendPort(port) {
  _port = port;
  _baseUrl = `http://127.0.0.1:${port}`;
}

/**
 * Get the backend base URL (e.g. "http://127.0.0.1:8080").
 * Does NOT include /api/v1.
 */
export function getBackendUrl() {
  if (_baseUrl) return _baseUrl;

  // Fallback: env var or default
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    // Strip /api/v1 suffix if present
    return envUrl.replace(/\/api\/v1\/?$/, '');
  }

  return 'http://127.0.0.1:8080';
}

/**
 * Get the full API base URL (e.g. "http://127.0.0.1:8080/api/v1").
 */
export function getApiBaseUrl() {
  return `${getBackendUrl()}/api/v1`;
}

/**
 * Get the backend port number.
 */
export function getBackendPort() {
  return _port || 8080;
}
