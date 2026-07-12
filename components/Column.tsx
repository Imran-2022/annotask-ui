'use client';

import React from 'react';
import { Task } from '@/types';
import { TaskCard } from './TaskCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface ColumnProps {
  title: string;
  status: Task['status'];
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

export const Column: React.FC<ColumnProps> = ({
  title,
  status,
  tasks,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 min-h-0 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
        <h2 className="font-bold text-sm tracking-wide text-slate-200 uppercase flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'todo' ? 'bg-blue-500' : status === 'in_progress' ? 'bg-indigo-500' : 'bg-emerald-500'
            }`}
          ></span>
          {title}
        </h2>
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-semibold">{tasks.length}</span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[18rem]"
          >
            {tasks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500 select-none border-2 border-dashed border-slate-800/60 rounded-xl">
                {status === 'done' ? (
                  <svg className="w-8 h-8 mb-2 opacity-40 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 mb-2 opacity-40 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <p className="text-xs font-semibold text-slate-400">No tasks yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Add a task to begin.</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={`task-${task.id}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={provided.draggableProps.style}
                      className="mb-4"
                    >
                      <TaskCard
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
