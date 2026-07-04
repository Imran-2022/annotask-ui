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
    const data = error.response?.data;
    if (typeof data === 'string') {
      return data;
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
        .trim() || error.message;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/auth/login/', {
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
      const response = await apiClient.post<RegisterResponse>('/auth/auth/register/', {
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
    await apiClient.post('/auth/auth/logout/');
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/auth/me/');
    return response.data;
  },
};
