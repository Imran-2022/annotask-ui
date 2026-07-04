import axios from 'axios';
import { apiClient } from './apiClient';
import { 
  Annotation, AnnotationProject, UserPresence, AnnotationComment,
  AnnotationHistory, AnnotationLayer, ReviewStatus 
} from '@/types';

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

export const collaborationService = {
  // Project Management
  async getProjects(): Promise<AnnotationProject[]> {
    try {
      const response = await apiClient.get<any>('/tasks/projects/');
      const data = response.data as any;
      if (Array.isArray(data)) return data as AnnotationProject[];
      if (data && Array.isArray(data.results)) return data.results as AnnotationProject[];
      return [];
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async getProject(id: number): Promise<AnnotationProject> {
    try {
      const response = await apiClient.get<AnnotationProject>(`/tasks/projects/${id}/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async createProject(data: Partial<AnnotationProject>): Promise<AnnotationProject> {
    try {
      const response = await apiClient.post<AnnotationProject>('/tasks/projects/', data);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async updateProject(id: number, data: Partial<AnnotationProject>): Promise<AnnotationProject> {
    try {
      const response = await apiClient.patch<AnnotationProject>(`/tasks/projects/${id}/`, data);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async deleteProject(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tasks/projects/${id}/`);
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async lockProject(id: number): Promise<AnnotationProject> {
    try {
      const response = await apiClient.post<AnnotationProject>(`/tasks/projects/${id}/lock/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async unlockProject(id: number): Promise<AnnotationProject> {
    try {
      const response = await apiClient.post<AnnotationProject>(`/tasks/projects/${id}/unlock/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async addCollaborator(projectId: number, userId: number): Promise<AnnotationProject> {
    try {
      const response = await apiClient.post<AnnotationProject>(
        `/tasks/projects/${projectId}/add_collaborator/`,
        { user_id: userId }
      );
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async removeCollaborator(projectId: number, userId: number): Promise<AnnotationProject> {
    try {
      const response = await apiClient.post<AnnotationProject>(
        `/tasks/projects/${projectId}/remove_collaborator/`,
        { user_id: userId }
      );
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async getActiveUsers(projectId: number): Promise<UserPresence[]> {
    try {
      const response = await apiClient.get<UserPresence[]>(`/tasks/projects/${projectId}/active_users/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  // Annotation Management
  async getAnnotations(projectId?: number): Promise<Annotation[]> {
    try {
      const params = projectId ? { project: projectId } : {};
      const response = await apiClient.get<any>('/tasks/annotations/', { params });
      const data = response.data as any;
      if (Array.isArray(data)) return data as Annotation[];
      if (data && Array.isArray(data.results)) return data.results as Annotation[];
      return [];
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async getAnnotation(id: number): Promise<Annotation> {
    try {
      const response = await apiClient.get<Annotation>(`/tasks/annotations/${id}/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async createAnnotation(data: Partial<Annotation>): Promise<Annotation> {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await apiClient.post<Annotation>('/tasks/annotations/', formData);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async updateAnnotation(id: number, data: Partial<Annotation>): Promise<Annotation> {
    try {
      const response = await apiClient.patch<Annotation>(`/tasks/annotations/${id}/`, data);
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

  async lockAnnotation(id: number): Promise<Annotation> {
    try {
      const response = await apiClient.post<Annotation>(`/tasks/annotations/${id}/lock/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async unlockAnnotation(id: number): Promise<Annotation> {
    try {
      const response = await apiClient.post<Annotation>(`/tasks/annotations/${id}/unlock/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async reviewAnnotation(id: number, reviewStatus: ReviewStatus): Promise<Annotation> {
    try {
      const response = await apiClient.post<Annotation>(
        `/tasks/annotations/${id}/review/`,
        { status: reviewStatus }
      );
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async getAnnotationHistory(id: number): Promise<AnnotationHistory[]> {
    try {
      const response = await apiClient.get<AnnotationHistory[]>(`/tasks/annotations/${id}/history/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async getAnnotationVersions(id: number): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(`/tasks/annotations/${id}/versions/`);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  // Comments
  async getComments(annotationId: number): Promise<AnnotationComment[]> {
    try {
      const response = await apiClient.get<any>('/tasks/comments/', {
        params: { annotation_id: annotationId }
      });
      const data = response.data as any;
      if (Array.isArray(data)) return data as AnnotationComment[];
      if (data && Array.isArray(data.results)) return data.results as AnnotationComment[];
      return [];
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async addComment(annotationId: number, text: string): Promise<AnnotationComment> {
    try {
      const response = await apiClient.post<AnnotationComment>('/tasks/comments/', {
        annotation: annotationId,
        text
      });
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  // Layers
  async getLayers(projectId: number): Promise<AnnotationLayer[]> {
    try {
      const response = await apiClient.get<any>('/tasks/layers/', {
        params: { project_id: projectId }
      });
      const data = response.data as any;
      if (Array.isArray(data)) return data as AnnotationLayer[];
      if (data && Array.isArray(data.results)) return data.results as AnnotationLayer[];
      return [];
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async createLayer(data: Partial<AnnotationLayer>): Promise<AnnotationLayer> {
    try {
      const response = await apiClient.post<AnnotationLayer>('/tasks/layers/', data);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async updateLayer(id: number, data: Partial<AnnotationLayer>): Promise<AnnotationLayer> {
    try {
      const response = await apiClient.patch<AnnotationLayer>(`/tasks/layers/${id}/`, data);
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async deleteLayer(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tasks/layers/${id}/`);
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  // User Presence
  async updatePresence(projectId: number, isActive: boolean = true): Promise<UserPresence> {
    try {
      const response = await apiClient.post<UserPresence>('/tasks/presence/update_presence/', {
        project_id: projectId,
        is_active: isActive
      });
      return response.data;
    } catch (err) {
      throw new Error(parseError(err));
    }
  },

  async cleanupInactiveUsers(): Promise<void> {
    try {
      await apiClient.post('/tasks/presence/cleanup_inactive/');
    } catch (err) {
      throw new Error(parseError(err));
    }
  }
};
