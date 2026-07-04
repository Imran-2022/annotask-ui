'use client';

import React, { useState } from 'react';
import { ShapeType, LabelClass, ReviewStatus } from '@/types';

interface AnnotationToolbarProps {
  currentTool: ShapeType;
  color: string;
  opacity: number;
  strokeWidth: number;
  labelClass: LabelClass;
  reviewStatus?: ReviewStatus;
  canReview?: boolean;
  canLock?: boolean;
  isLocked?: boolean;
  onToolChange: (tool: ShapeType) => void;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onStrokeWidthChange: (width: number) => void;
  onLabelChange: (label: LabelClass) => void;
  onReview?: (status: ReviewStatus) => void;
  onLock?: () => void;
  onUnlock?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onClearAll?: () => void;
}

const TOOLS: ShapeType[] = ['polygon', 'circle', 'rectangle', 'line', 'freehand', 'point'];
const LABELS: LabelClass[] = ['tumor', 'healthy', 'artifact', 'other'];
const REVIEW_STATUSES: ReviewStatus[] = ['pending', 'approved', 'rejected', 'flagged'];

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  currentTool,
  color,
  opacity,
  strokeWidth,
  labelClass,
  reviewStatus = 'pending',
  canReview = false,
  canLock = false,
  isLocked = false,
  onToolChange,
  onColorChange,
  onOpacityChange,
  onStrokeWidthChange,
  onLabelChange,
  onReview,
  onLock,
  onUnlock,
  onUndo,
  onRedo,
  onDelete,
  onClearAll,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="bg-gray-800 border-b border-gray-700 p-4 rounded-lg">
      {/* Tool Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-200 mb-2">
          Drawing Tools
        </label>
        <div className="flex flex-wrap gap-2">
          {TOOLS.map(tool => (
            <button
              key={tool}
              onClick={() => onToolChange(tool)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                currentTool === tool
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              title={tool.charAt(0).toUpperCase() + tool.slice(1)}
            >
              {tool === 'polygon' && '🔷'}
              {tool === 'circle' && '⭕'}
              {tool === 'rectangle' && '▭'}
              {tool === 'line' && '📍'}
              {tool === 'freehand' && '✏️'}
              {tool === 'point' && '•'}
            </button>
          ))}
        </div>
      </div>

      {/* Label Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-200 mb-2">
          Label Class
        </label>
        <select
          value={labelClass}
          onChange={e => onLabelChange(e.target.value as LabelClass)}
          className="w-full bg-gray-700 text-white px-3 py-2 rounded text-sm border border-gray-600"
        >
          {LABELS.map(label => (
            <option key={label} value={label}>
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Color, Opacity, Stroke Width */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Color Picker */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Color
          </label>
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full h-10 rounded border-2 border-gray-600 cursor-pointer"
            style={{ backgroundColor: color }}
            title="Click to change color"
          />
          {showColorPicker && (
            <div className="absolute top-full mt-2 z-10 bg-gray-700 p-3 rounded shadow-lg">
              <div className="flex flex-wrap gap-2">
                {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#000000', '#ffffff'].map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      onColorChange(c);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border-2 border-gray-500"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Opacity */}
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Opacity: {(opacity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={e => onOpacityChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Stroke Width */}
        <div>
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Stroke: {strokeWidth.toFixed(1)}px
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={strokeWidth}
            onChange={e => onStrokeWidthChange(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Review Status */}
      {canReview && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-200 mb-2">
            Review Status
          </label>
          <div className="flex flex-wrap gap-2">
            {REVIEW_STATUSES.map(status => (
              <button
                key={status}
                onClick={() => onReview?.(status)}
                className={`px-3 py-2 rounded text-sm font-medium transition ${
                  reviewStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {status === 'pending' && '⏳'}
                {status === 'approved' && '✅'}
                {status === 'rejected' && '❌'}
                {status === 'flagged' && '🚩'}
                {' '}
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Undo/Redo */}
        <button
          onClick={onUndo}
          className="px-3 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition text-sm"
          title="Undo"
        >
          ↶ Undo
        </button>
        <button
          onClick={onRedo}
          className="px-3 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition text-sm"
          title="Redo"
        >
          ↷ Redo
        </button>

        {/* Lock/Unlock */}
        {canLock && (
          <button
            onClick={isLocked ? onUnlock : onLock}
            className={`px-3 py-2 rounded transition text-sm font-medium ${
              isLocked
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {isLocked ? '🔒 Locked' : '🔓 Lock'}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800 transition text-sm"
          title="Delete selected annotation"
        >
          🗑️ Delete
        </button>

        {/* Clear All */}
        <button
          onClick={onClearAll}
          className="px-3 py-2 bg-red-900 text-white rounded hover:bg-red-950 transition text-sm"
          title="Clear all annotations"
        >
          ✕ Clear All
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 p-2 bg-gray-700 rounded text-xs text-gray-300">
        <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
        <ul className="space-y-1">
          <li><kbd className="bg-gray-600 px-1 rounded">Z</kbd> + Scroll - Zoom</li>
          <li><kbd className="bg-gray-600 px-1 rounded">Space</kbd> - Pan</li>
          <li><kbd className="bg-gray-600 px-1 rounded">Ctrl+Z</kbd> - Undo</li>
          <li><kbd className="bg-gray-600 px-1 rounded">Ctrl+Y</kbd> - Redo</li>
          <li><kbd className="bg-gray-600 px-1 rounded">Del</kbd> - Delete Selected</li>
        </ul>
      </div>
    </div>
  );
};
