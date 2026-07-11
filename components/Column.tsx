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
    <div className="flex flex-col overflow-hidden border">
      <div className="flex items-center justify-between gap-3 px-4 py-3 font-semibold border-b">
        <h2 className="text-base md:text-lg">{title}</h2>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 p-4 min-h-[18rem]"
          >
            {tasks.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div>
                  <p className="font-semibold">No tasks yet</p>
                  <p className="text-sm">Add a task to begin.</p>
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
