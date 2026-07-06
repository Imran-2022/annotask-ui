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
  const headerColors: Record<Task['status'], string> = {
    todo: 'bg-indigo-600 text-white',
    in_progress: 'bg-sky-600 text-white',
    done: 'bg-emerald-600 text-white',
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#F8FAFC] shadow-sm">
      <div className={`${headerColors[status]} flex items-center justify-between gap-3 px-5 py-4 font-semibold rounded-t-3xl`}>
        <h2 className="text-base md:text-lg">{title}</h2>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-white">
            {title} ({tasks.length})
          </span>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 p-4 min-h-[18rem] transition-all ${
              snapshot.isDraggingOver ? 'bg-slate-100 ring-2 ring-offset-2 ring-fuchsia-300/40' : 'bg-[#F8FAFC]'
            }`}
          >
            {tasks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-500">
                <div className="p-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m0 10v-6a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">No tasks for today</p>
                  <p className="text-sm text-slate-500">Add a new task to get started</p>
                </div>
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
