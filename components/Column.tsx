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
    todo: 'bg-gray-50',
    in_progress: 'bg-blue-50',
    done: 'bg-green-50',
  };

  const headerColors: Record<Task['status'], string> = {
    todo: 'bg-gray-200',
    in_progress: 'bg-blue-200',
    done: 'bg-green-200',
  };

  return (
    <div className={`flex flex-col rounded-lg overflow-hidden shadow-md ${columnColors[status]}`}>
      <div className={`${headerColors[status]} p-4 font-bold text-gray-900`}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg">{title}</h2>
          <span className="bg-white text-gray-900 rounded-full px-3 py-1 text-sm font-semibold">
            {tasks.length}
          </span>
        </div>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 p-4 min-h-96 ${
              snapshot.isDraggingOver ? 'bg-opacity-50 bg-blue-100' : ''
            }`}
          >
            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No tasks for today
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
                      className="mb-3"
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
