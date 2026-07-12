import React from 'react';

interface BottomToolbarProps {
  tool: 'draw' | 'pan' | 'select';
  onToolChange: (tool: 'draw' | 'pan' | 'select') => void;
  isDrawing: boolean;
  onStartDrawing: () => void;
  onStopDrawing: () => void;
  hasCurrentPolygon: boolean;
  onSaveAnnotation: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFullscreen: () => void;
  zoom: number;
}

export const AnnotateBottomToolbar: React.FC<BottomToolbarProps> = ({
  tool,
  onToolChange,
  isDrawing,
  onStartDrawing,
  onStopDrawing,
  hasCurrentPolygon,
  onSaveAnnotation,
  onDeleteSelected,
  hasSelection,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetView,
  onFullscreen,
  zoom,
}) => {
  const isDrawTool = tool === 'draw';

  return (
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            onToolChange('draw');
            onStartDrawing();
          }}
          className={`bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            isDrawTool ? 'hover:bg-blue-500' : 'hover:bg-blue-500'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          Draw Polygon
        </button>

        <button
          onClick={() => onToolChange('pan')}
          className="hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2. 5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0m2.5 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pan
        </button>
      </div>

      <div className="flex items-center bg-slate-700 rounded-lg overflow-hidden border border-slate-600">
        <button
          onClick={onZoomOut}
          className="px-3 py-1 hover:bg-slate-600 text-sm"
        >
          -
        </button>
        <span className="px-3 py-1 text-xs font-mono font-semibold min-w-[50px] text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={onZoomIn}
          className="px-3 py-1 hover:bg-slate-600 text-sm"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        {hasCurrentPolygon && (
          <button
            onClick={onSaveAnnotation}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            title="Save Polygon"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
        )}
        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="hover:bg-slate-700 text-slate-400 hover:text-rose-400 p-1.5 rounded-md text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <button
          onClick={onUndo}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Undo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={onRedo}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Redo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        <button
          onClick={onResetView}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Reset"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={onFullscreen}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Fullscreen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
