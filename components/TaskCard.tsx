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
    <div className={`border p-4 ${isDragging ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold break-words">{task.title}</h3>
          {task.description && (
            <p className="mt-2 text-sm break-words">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(task)}
            className="px-2 py-1 border border-slate-400 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="px-2 py-1 border border-slate-400 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm">
        <div>{task.priority}</div>
        {task.tags_list && task.tags_list.length > 0 && (
          <div className="mt-2">
            {task.tags_list.join(', ')}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {format(new Date(task.due_date), 'MMM d, yyyy')}
      </div>
    </div>
  );
};
