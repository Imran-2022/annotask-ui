import axios from 'axios';
import { apiClient } from './apiClient';
import { Annotation } from '../types';

const parseError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data;
    if (status === 401) return 'Unauthorized. Please login.';
    if (data && typeof data === 'object') {
      if ('detail' in data && typeof data.detail === 'string') return data.detail;
      const values = Object.values(data).flat();
      return values.map((v) => (typeof v === 'string' ? v : Array.isArray(v) ? v.join(' ') : '')).filter(Boolean).join(' ') || String(err);
    }
    return err.message;
  }
  return err instanceof Error ? err.message : String(err);
};

export const annotationService = {
  async getAnnotations(): Promise<Annotation[]> {
    try {
      const response = await apiClient.get<Annotation[]>('/tasks/annotations/');
      const data = response.data as any;
      if (Array.isArray(data)) return data as Annotation[];
      // Handle DRF paginated response { count, next, previous, results }
      if (data && Array.isArray(data.results)) return data.results as Annotation[];
      return [];
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async createAnnotation(imageFile: File, annotationData: unknown): Promise<Annotation> {
    try {
      const formData = new FormData();
      formData.append('image_file', imageFile);
      formData.append('annotation_data', JSON.stringify(annotationData));

      const response = await apiClient.post<Annotation>('/tasks/annotations/', formData);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async updateAnnotation(id: number, annotationData: unknown): Promise<Annotation> {
    try {
      const formData = new FormData();
      formData.append('annotation_data', JSON.stringify(annotationData));

      const response = await apiClient.patch<Annotation>(`/tasks/annotations/${id}/`, formData);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async deleteAnnotation(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tasks/annotations/${id}/`);
    } catch (err) {
      throw new Error(parseError(err));
    }
  },
};
