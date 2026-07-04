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
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };

  const statusColors: Record<string, string> = {
    todo: 'border-l-4 border-gray-400 bg-gray-50',
    in_progress: 'border-l-4 border-blue-400 bg-blue-50',
    done: 'border-l-4 border-green-400 bg-green-50',
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 shadow cursor-move hover:shadow-lg transition ${
        statusColors[task.status]
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex-1 break-words">{task.title}</h3>
        <div className="flex gap-2 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="text-blue-600 hover:text-blue-800 text-sm"
            title="Edit task"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-800 text-sm"
            title="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3 break-words">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`inline-block px-2 py-1 text-xs font-medium rounded border ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        {task.tags_list && task.tags_list.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags_list.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags_list.length > 2 && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                +{task.tags_list.length - 2}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        {format(new Date(task.due_date), 'MMM d, yyyy')}
      </div>
    </div>
  );
};
