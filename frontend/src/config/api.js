import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://cravvio-major-project.onrender.com');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// If a token exists from a prior login, attach it to Authorization header
try {
  const stored = localStorage.getItem('token') || localStorage.getItem('auth');
  if (stored) {
    // if `auth` contains a JSON { token } pattern, attempt to parse
    let token = stored;
    try {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.token) token = parsed.token;
    } catch (e) { /* not JSON, use raw */ }
    if (token) apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
} catch (e) { /* ignore when localStorage not available */ }

// Add response interceptor to handle global errors (e.g., unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Mark auth errors so components can decide how to handle navigation
    if (error.response && error.response.status === 401) {
      try { error.isAuthError = true; } catch (e) { /* ignore */ }
    }
    return Promise.reject(error);
  }
);

export default API_BASE_URL;
