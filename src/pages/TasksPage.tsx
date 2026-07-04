'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { DateSelector } from '@/components/DateSelector';
import { Board } from '@/components/Board';
import { TaskModal } from '@/components/TaskModal';
import { Task } from '@/types';

export default function TasksPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState('');

  const { isAuthenticated, logout, user } = useAuth();
  const {
    tasks,
    selectedDate,
    isLoading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    setSelectedDate,
    reorderTasks,
    changeTaskStatus,
  } = useTasks();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchTasks(new Date());
  }, [isAuthenticated, navigate, fetchTasks]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    fetchTasks(date);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const handleSaveTask = async (
    formData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'> | Partial<Task>
  ) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await addTask(formData as Omit<Task, 'id' | 'created_at' | 'updated_at' | 'order'>);
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  const handleReorder = async (updatedTasks: Task[]) => {
    try {
      await reorderTasks(updatedTasks);
    } catch (err) {
      setError('Failed to reorder tasks');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Task Manager</h1>
            {user && <p className="text-sm text-slate-500 mt-1">{user.email}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/annotate')}
              className="rounded-2xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
            >
              Annotate Images
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-3xl bg-red-50 border border-red-200 p-4 text-red-700">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-700 opacity-80 hover:opacity-100">
                ✕
              </button>
            </div>
          </div>
        )}

        <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={handleAddTask}
            className="inline-flex items-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700"
          >
            + Add Task
          </button>
        </div>

        <div className="mt-6">
          <Board
            tasks={tasks}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onReorder={handleReorder}
            isLoading={isLoading}
          />
        </div>
      </main>

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
}
