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
  return (
    <div className={`bg-slate-800/70 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition group relative ${isDragging ? 'opacity-80' : ''}`}>
      <div className="flex justify-between items-start gap-2 mb-1">
        <h3 className="font-semibold text-sm text-slate-100 group-hover:text-blue-400 transition">{task.title}</h3>
        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
          <button
            onClick={() => onEdit(task)}
            className="text-xs hover:bg-slate-700 p-1 rounded text-slate-300"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs hover:bg-rose-950 p-1 rounded text-rose-400"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">{task.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{task.priority}</span>
        {task.tags_list && task.tags_list.length > 0 &&
          task.tags_list.map((tag) => (
            <span key={tag} className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium">{tag}</span>
          ))}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-700/40 pt-2.5">
        <span>📅</span>
        <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
      </div>
    </div>
  );
};
