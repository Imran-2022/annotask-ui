'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import { DateSelector } from '@/components/DateSelector';
import { Board } from '@/components/Board';
import { ConfirmDialog } from '@/components/ConfirmDialog';
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
    actionLoading,
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

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteTaskId, setPendingDeleteTaskId] = useState<number | null>(null);

  const handleDeleteTask = (taskId: number) => {
    setPendingDeleteTaskId(taskId);
    setIsConfirmOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (pendingDeleteTaskId === null) return;
    try {
      await deleteTask(pendingDeleteTaskId);
    } catch (err) {
      setError('Failed to delete task');
    } finally {
      setIsConfirmOpen(false);
      setPendingDeleteTaskId(null);
    }
  };

  const cancelDeleteTask = () => {
    setIsConfirmOpen(false);
    setPendingDeleteTaskId(null);
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

  const filteredTasks = tasks;

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">AnnoTask</h1>
            {user && <p className="text-sm mt-1">{user.email}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/annotate')}
              className="border px-4 py-2 text-sm font-semibold"
            >
              Annotate Images
            </button>
            <button
              onClick={handleLogout}
              className="border px-4 py-2 text-sm font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {error && (
          <div className="mb-6 border p-4">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-sm">
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="mt-1 border border-slate-300 px-3 py-3 sticky top-4 z-20 bg-white">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                onClick={handleAddTask}
                className="border border-slate-400 px-4 py-2 text-sm font-semibold"
              >
                Add Task
              </button>
            </div>

            <div>
              <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Board
            tasks={filteredTasks}
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
        isLoading={actionLoading}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Delete task"
        description="This action cannot be undone. Are you sure you want to delete this task?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
      />
    </div>
  );
}
