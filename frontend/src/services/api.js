import axios from 'axios';

// Route all API calls through Vite's dev-server proxy (/api -> localhost:8000).
// This works both on localhost and when the frontend is served behind a tunnel
// (Cloudflare, ngrok, etc.) — the browser never tries to reach port 8000 directly.
const api = axios.create({
  baseURL: '/api',
  timeout: 15000, // 15 second timeout — prevents infinite "Signing In..." hangs
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Don't redirect if already on login/register page
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        // Store a flag so the login page can show "session expired"
        localStorage.setItem('sessionExpired', 'true');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
