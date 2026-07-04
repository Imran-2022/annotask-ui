'use client';

import React from 'react';
import { Task } from '@/types';
import { Column } from './Column';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';

interface BoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onReorder: (updatedTasks: Task[]) => void;
  isLoading?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onReorder,
  isLoading = false,
}) => {
  const todoTasks = tasks.filter((t) => t.status === 'todo').sort((a, b) => a.order - b.order);
  const inProgressTasks = tasks
    .filter((t) => t.status === 'in_progress')
    .sort((a, b) => a.order - b.order);
  const doneTasks = tasks.filter((t) => t.status === 'done').sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId.replace('task-', ''), 10);
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const destinationStatus = destination.droppableId as Task['status'];
    const movedTask: Task = { ...task, status: destinationStatus };

    const tasksWithoutMoving = tasks.filter((item) => item.id !== taskId);
    const groupedTasks: Record<Task['status'], Task[]> = {
      todo: tasksWithoutMoving
        .filter((item) => item.status === 'todo')
        .sort((a, b) => a.order - b.order),
      in_progress: tasksWithoutMoving
        .filter((item) => item.status === 'in_progress')
        .sort((a, b) => a.order - b.order),
      done: tasksWithoutMoving
        .filter((item) => item.status === 'done')
        .sort((a, b) => a.order - b.order),
    };

    const destinationTasks = Array.from(groupedTasks[destinationStatus]);
    destinationTasks.splice(destination.index, 0, movedTask);
    groupedTasks[destinationStatus] = destinationTasks;

    const updatedTasks: Task[] = [];
    (['todo', 'in_progress', 'done'] as Task['status'][]).forEach((status) => {
      groupedTasks[status].forEach((item, index) => {
        updatedTasks.push({
          ...item,
          status,
          order: index,
        });
      });
    });

    onReorder(updatedTasks);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Column
          title="To Do"
          status="todo"
          tasks={todoTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <Column
          title="In Progress"
          status="in_progress"
          tasks={inProgressTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
        <Column
          title="Done"
          status="done"
          tasks={doneTasks}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </div>
    </DragDropContext>
  );
};
