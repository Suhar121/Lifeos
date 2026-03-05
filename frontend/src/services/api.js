import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
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
