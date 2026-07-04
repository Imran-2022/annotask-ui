'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { taskService } from '@/services/taskService';
import { Task, TaskState } from '@/types';

const defaultDate = new Date();

const TaskContext = createContext<TaskState | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(defaultDate);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async (date: Date) => {
    setIsLoading(true);
    setError(null);
    setSelectedDate(date);
    try {
      const data = await taskService.getTasksByDate(date);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTasksByDateRange = useCallback(async (startDate: Date, endDate: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasksByDateRange(startDate, endDate);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTask = await taskService.createTask(task);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTask = useCallback(async (id: number, task: Partial<Task>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.updateTask(id, task);
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reorderTasks = useCallback(async (updatedTasks: Task[]) => {
    setError(null);
    try {
      setTasks(updatedTasks);
      await taskService.reorderTasks(updatedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks');
    }
  }, []);

  const changeTaskStatus = useCallback(async (taskId: number, newStatus: Task['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTask = await taskService.changeTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change status');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: TaskState = {
    tasks,
    selectedDate,
    isLoading,
    error,
    fetchTasks,
    fetchTasksByDateRange,
    addTask,
    updateTask,
    deleteTask,
    setSelectedDate,
    reorderTasks,
    changeTaskStatus,
    setError,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within TaskProvider');
  }
  return context;
};
