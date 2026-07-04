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
  const columnColors: Record<Task['status'], string> = {
    todo: 'bg-white',
    in_progress: 'bg-sky-50',
    done: 'bg-emerald-50',
  };

  const headerColors: Record<Task['status'], string> = {
    todo: 'bg-slate-100',
    in_progress: 'bg-sky-100',
    done: 'bg-emerald-100',
  };

  return (
    <div className={`flex flex-col rounded-[28px] overflow-hidden shadow-[0_20px_40px_rgba(15,23,42,0.08)] ${columnColors[status]}`}>
      <div className={`${headerColors[status]} p-5 font-semibold text-slate-900 border-b border-slate-200 rounded-t-[28px]`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base md:text-lg">{title}</h2>
          <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 p-5 min-h-[28rem] ${
              snapshot.isDraggingOver ? 'bg-slate-100' : ''
            }`}
          >
            {tasks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-slate-500">
                <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
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
