// Utility helpers for JWT-based auth (mock implementation)

const TOKEN_KEY = 'emp_dashboard_token';
const USER_KEY  = 'emp_dashboard_user';

/**
 * Store token and user in localStorage
 */
export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieve stored token
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieve stored user object
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear auth data (logout)
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if the stored token is still valid (non-expired)
 */
export function isTokenValid() {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}
