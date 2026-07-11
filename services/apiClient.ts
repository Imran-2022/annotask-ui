import axios, { AxiosRequestHeaders, AxiosRequestConfig } from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_URL = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

export const apiClient = axios.create({
  baseURL: API_URL,
});

let authToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const clearAuthAndRedirect = () => {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_access');
    localStorage.removeItem('auth_refresh');
    window.location.href = '/login';
  }
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    if (!config.headers) {
      config.headers = {} as AxiosRequestHeaders;
    }
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${authToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('auth_refresh') : null;
      if (!refreshToken) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              if (originalRequest.headers) {
                (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        setAuthToken(newAccessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_access', newAccessToken);
        }
        onRefreshed(newAccessToken);

        if (originalRequest.headers) {
          (originalRequest.headers as AxiosRequestHeaders).Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        onRefreshed(null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
