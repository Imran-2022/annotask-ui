import React from 'react';
import { Annotation } from '../services/medicalService';

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
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h2 className="font-semibold text-sm tracking-wide text-slate-200">Annotations ({annotations.length})</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-slate-400 text-center flex flex-col justify-center items-center">
        {annotations.length === 0 ? (
          <>
            <div className="text-3xl opacity-30 mb-2">👁️‍🗨️</div>
            <p className="text-xs max-w-[200px]">No annotations yet. Draw on the image canvas to create one.</p>
          </>
        ) : (
          <div className="space-y-2 w-full">
            {annotations.map((ann) => (
              <button
                key={ann.id}
                type="button"
                onClick={() => onSelectAnnotation(selectedAnnotationId === ann.id ? null : ann.id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                  selectedAnnotationId === ann.id
                    ? 'border-slate-500 bg-slate-800 text-slate-100'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium capitalize">{ann.label}</span>
                  <span className="text-xs text-slate-400">{ann.polygon_points.length} pts</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
