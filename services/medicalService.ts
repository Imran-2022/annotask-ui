import { apiClient } from './apiClient';

export interface MedicalImage {
  id: number;
  file: string;
  file_url: string;
  filename: string;
  uploaded_at: string;
  updated_at: string;
  annotations: Annotation[];
}

export interface Annotation {
  id: number;
  image: number;
  label: 'tumor' | 'organ' | 'vessel' | 'other';
  polygon_points: Array<{ x: number; y: number }>;
  created_at: string;
  updated_at: string;
}

class MedicalImageService {
  private resolveFileUrl(fileUrl: string | null | undefined): string | null {
    if (!fileUrl) return null;
    // If already absolute, return as-is
    try {
      const parsed = new URL(fileUrl);
      return parsed.toString();
    } catch (e) {
      // relative URL - resolve against API base URL
      try {
        const base = apiClient.defaults.baseURL || window.location.origin;
        return new URL(fileUrl, base).toString();
      } catch (err) {
        return fileUrl;
      }
    }
  }

  private normalizeImage(img: any): MedicalImage {
    return {
      ...img,
      file_url: this.resolveFileUrl(img.file_url) as string,
    };
  }
  async uploadImages(files: File[]): Promise<MedicalImage[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });

    const response = await apiClient.post('/images/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = response.data;
    if (Array.isArray(data)) return data.map((d: any) => this.normalizeImage(d));
    if (data.results && Array.isArray(data.results)) return data.results.map((d: any) => this.normalizeImage(d));
    return [this.normalizeImage(data)];
  }

  async getImages(): Promise<MedicalImage[]> {
    const response = await apiClient.get('/images/');
    const data = response.data;
    const list = data.results || data;
    if (!Array.isArray(list)) return [];
    return list.map((img: any) => this.normalizeImage(img));
  }

  async getImage(id: number): Promise<MedicalImage> {
    const response = await apiClient.get(`/images/${id}/`);
    return this.normalizeImage(response.data);
  }

  async deleteImage(id: number): Promise<void> {
    await apiClient.delete(`/images/${id}/`);
  }
}

class AnnotationService {
  async getAnnotations(imageId: number): Promise<Annotation[]> {
    const response = await apiClient.get('/annotations/', {
      params: { image: imageId },
    });
    return response.data.results || response.data;
  }

  async createAnnotation(imageId: number, label: string, polygonPoints: Array<{ x: number; y: number }>): Promise<Annotation> {
    const response = await apiClient.post('/annotations/', {
      image: imageId,
      label,
      polygon_points: polygonPoints,
    });
    return response.data;
  }

  async updateAnnotation(id: number, data: Partial<Pick<Annotation, 'label' | 'polygon_points'>>): Promise<Annotation> {
    const response = await apiClient.put(`/annotations/${id}/`, data);
    return response.data;
  }

  async deleteAnnotation(id: number): Promise<void> {
    await apiClient.delete(`/annotations/${id}/`);
  }
}

export const medicalImageService = new MedicalImageService();
export const annotationService = new AnnotationService();
