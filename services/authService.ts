import axios from 'axios';
import { apiClient } from './apiClient';
import { User } from '../types';

interface LoginResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

interface RegisterResponse {
  message: string;
  access: string;
  refresh: string;
  user: User;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    const data = response?.data;

    if (!response) {
      return 'Unable to connect to the server. Please check your network and try again.';
    }

    if (response.status === 404) {
      return 'Registration service not found. Please refresh the page or contact support.';
    }

    if (typeof data === 'string') {
      const trimmed = data.trim();
      if (trimmed.startsWith('<!doctype html>') || trimmed.startsWith('<html')) {
        return 'Unexpected response from the server. Please try again later.';
      }
      return trimmed || error.message;
    }

    if (data && typeof data === 'object') {
      if ('detail' in data && typeof data.detail === 'string') {
        return data.detail;
      }
      if ('message' in data && typeof data.message === 'string') {
        return data.message;
      }
      const values = Object.values(data).flat();
      return values
        .map((value) => (typeof value === 'string' ? value : Array.isArray(value) ? value.join(' ') : ''))
        .filter(Boolean)
        .join(' ')
        .trim() || `Request failed with status ${response.status}.`;
    }

    return `Request failed with status ${response.status}.`;
  }
  return error instanceof Error ? error.message : String(error);
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login/', {
        email,
        password,
      });
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async register(
    username: string,
    email: string,
    password: string,
    password2: string
  ): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register/', {
        username,
        email,
        password,
        password2,
        first_name: '',
        last_name: '',
      });
      return response.data;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout/');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me/');
    return response.data;
  },
};
