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
    <div className="h-full w-full bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden">
      <header className="h-16 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AnnoTask</h1>
            {user && <p className="text-xs text-slate-400 font-medium">{user.email}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/annotate')}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition shadow-md shadow-blue-600/10"
          >
            Annotate Images
          </button>
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="h-14 bg-slate-900/50 border-b border-slate-800/60 px-6 flex items-center justify-between shrink-0">
        <button
          onClick={handleAddTask}
          className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-500 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5"
        >
          <span className="text-sm font-normal">+</span> Add Task
        </button>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
            <input
              type="date"
              value={selectedDate.toISOString().slice(0, 10)}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            />
          </div>
          <button
            onClick={() => handleDateChange(new Date())}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            Today
          </button>
        </div>
      </section>

      <main className="flex-1 p-6 min-h-0 w-full overflow-hidden bg-slate-950">
        <Board
          tasks={filteredTasks}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onReorder={handleReorder}
          isLoading={isLoading}
        />
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
