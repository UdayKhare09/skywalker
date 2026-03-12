import axios from 'axios';

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're already refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login') ||
                             originalRequest.url?.includes('/api/auth/register') ||
                             originalRequest.url?.includes('/api/auth/refresh');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/api/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh failed — redirect to login
        const isAuthPage = window.location.pathname === '/login' ||
                           window.location.pathname === '/register';
        if (!isAuthPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
