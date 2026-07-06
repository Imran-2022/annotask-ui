'use client';

import React from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  isDragging,
}) => {
  const priorityColors: Record<string, string> = {
    high: 'bg-rose-100 text-rose-800 border-rose-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const statusStyles: Record<Task['status'], string> = {
    todo: 'bg-indigo-50 border-indigo-400 text-slate-900',
    in_progress: 'bg-sky-50 border-sky-400 text-slate-900',
    done: 'bg-emerald-50 border-emerald-400 text-slate-900',
  };

  return (
    <div
      className={`border-l-4 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${statusStyles[task.status]} ${
        isDragging ? 'opacity-80 shadow-md' : ''
      } rounded-none`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 break-words">{task.title}</h3>
          {task.description && (
            <p className="mt-2 text-sm text-slate-500 break-words">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition"
            title="Edit task"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded-full bg-slate-100 p-2 text-red-600 hover:bg-red-100 transition"
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        {task.tags_list && task.tags_list.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {task.tags_list.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700"
              >
                {tag}
              </span>
            ))}
            {task.tags_list.length > 2 && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                +{task.tags_list.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {format(new Date(task.due_date), 'MMM d, yyyy')}
      </div>
    </div>
  );
};
