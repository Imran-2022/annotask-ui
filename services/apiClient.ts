import axios, { AxiosRequestHeaders } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
});

let authToken: string | null = null;

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
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_access');
        localStorage.removeItem('auth_refresh');
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
