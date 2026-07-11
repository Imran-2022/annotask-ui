import React from 'react';
import { Annotation } from '../services/medicalService';
import { FaTrash } from 'react-icons/fa';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const getAnnotationColor = (index: number): string => {
  return COLORS[index % COLORS.length];
};

interface AnnotationsSidebarProps {
  annotations: Annotation[];
  selectedAnnotationId: number | null;
  onSelectAnnotation: (id: number | null) => void;
  onDeleteAnnotation: (id: number) => void;
}

export const AnnotationsSidebar: React.FC<AnnotationsSidebarProps> = ({
  annotations,
  selectedAnnotationId,
  onSelectAnnotation,
  onDeleteAnnotation,
}) => {
  return (
    <div className="w-64 border-l border-slate-200 bg-white overflow-hidden flex flex-col">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-slate-900 font-semibold text-sm">Annotations ({annotations.length})</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {annotations.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            No annotations yet. Draw on the image to create one.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {annotations.map((ann, idx) => (
              <div
                key={ann.id}
                onClick={() => onSelectAnnotation(selectedAnnotationId === ann.id ? null : ann.id)}
                className={`p-3 cursor-pointer transition border ${
                  selectedAnnotationId === ann.id
                    ? 'border-blue-500 bg-slate-100 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getAnnotationColor(idx) }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono truncate capitalize">{ann.label}</p>
                      <p className="text-xs text-slate-500">{ann.polygon_points.length} points</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAnnotation(ann.id);
                    }}
                    className="p-1 text-slate-700 hover:text-red-600 transition"
                    title="Delete annotation"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
