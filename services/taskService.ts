import { apiClient } from './apiClient';
import { Task } from '../types';
import { format } from 'date-fns';

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks/');
    return response.data;
  },

  async getTasksByDate(date: Date): Promise<Task[]> {
    const dateStr = format(date, 'yyyy-MM-dd');
    const response = await apiClient.get<Task[]>('/tasks/by_date/', {
      params: { date: dateStr },
    });
    return response.data;
  },

  async getTasksByDateRange(startDate: Date, endDate: Date): Promise<Task[]> {
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    const response = await apiClient.get<Task[]>('/tasks/by_date_range/', {
      params: {
        start_date: startDateStr,
        end_date: endDateStr,
      },
    });
    return response.data;
  },

  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks/', task);
    return response.data;
  },

  async updateTask(id: number, task: Partial<Task>): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}/`, task);
    return response.data;
  },

  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}/`);
  },

  async changeTaskStatus(taskId: number, status: Task['status']): Promise<Task> {
    const response = await apiClient.post<Task>(`/tasks/${taskId}/change_status/`, {
      status,
    });
    return response.data;
  },

  async reorderTasks(tasks: Task[]): Promise<void> {
    await apiClient.post('/tasks/reorder/', {
      tasks: tasks.map((t) => ({
        id: t.id,
        status: t.status,
        order: t.order,
      })),
    });
  },
};
