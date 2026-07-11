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
          className={`bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${
            isDrawTool ? 'hover:bg-blue-500' : 'hover:bg-blue-500'
          }`}
        >
          <span className="text-sm">✎</span>
          Draw Polygon
        </button>

        <button
          onClick={() => onToolChange('pan')}
          className="hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition"
        >
          <span>✋</span>
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
        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="hover:bg-slate-700 text-slate-400 hover:text-rose-400 p-1.5 rounded-md text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Delete"
        >
          🗑️
        </button>
        <button
          onClick={onUndo}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Undo"
        >
          ↩️
        </button>
        <button
          onClick={onRedo}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Redo"
        >
          ↪️
        </button>
        <button
          onClick={onResetView}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Reset"
        >
          🔄
        </button>
        <button
          onClick={onFullscreen}
          className="hover:bg-slate-700 text-slate-300 p-1.5 rounded-md text-xs transition"
          title="Fullscreen"
        >
          ⛶
        </button>
      </div>
    </div>
  );
};
