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
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

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

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handlePriorityFilterChange = (value: 'all' | 'low' | 'medium' | 'high') => {
    setPriorityFilter(value);
  };

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    const content = [task.title, task.description || '', ...(task.tags_list || [])].join(' ').toLowerCase();
    const matchesSearch = content.includes(query);
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const completedCount = tasks.filter((task) => task.status === 'done').length;
  const totalCount = tasks.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AnnoTask</h1>
            {user && <p className="text-sm text-slate-500 mt-1">{user.email}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/annotate')}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Annotate Images
            </button>
            <button
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
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

        <div className="mt-1 rounded-3xl bg-[#F8FAFC] px-3 py-3 shadow-sm sticky top-4 z-20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleAddTask}
                className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                + Add Task
              </button>
              <span className="rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
                {completedCount}/{totalCount} completed
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-end">
              <div className="relative rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm min-w-[12rem]">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.65 3.65a7.5 7.5 0 0012.99 12.99z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search tasks"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full rounded-full border-none bg-transparent pl-10 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="relative rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <select
                  value={priorityFilter}
                  onChange={(e) => handlePriorityFilterChange(e.target.value as any)}
                  className="w-full bg-transparent text-sm text-slate-700 outline-none"
                >
                  <option value="all">All priorities</option>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <DateSelector selectedDate={selectedDate} onDateChange={handleDateChange} />

              <button
                onClick={handleLogout}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Logout
              </button>
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
    </div>
  );
}
