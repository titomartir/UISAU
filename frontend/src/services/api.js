import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshInProgress = false;
let pendingRequests = [];

const resolvePending = (token) => {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 401 && !originalRequest._retry) {
      const authState = useAuthStore.getState();
      if (!authState.refreshToken) {
        authState.clearAuth();
        return Promise.reject(error);
      }

      if (refreshInProgress) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      refreshInProgress = true;

      try {
        const refreshRes = await axios.post('http://localhost:3001/api/auth/refresh', {
          refreshToken: authState.refreshToken
        });

        const newAccess = refreshRes.data.accessToken;
        const newRefresh = refreshRes.data.refreshToken;

        useAuthStore.getState().setAuth({
          accessToken: newAccess,
          refreshToken: newRefresh,
          user: authState.user
        });

        resolvePending(newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        refreshInProgress = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
