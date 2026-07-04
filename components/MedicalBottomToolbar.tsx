import React from 'react';
import {
  FaPencilAlt,
  FaPlus,
  FaMinus,
  FaHandPaper,
  FaTrashAlt,
  FaUndo,
  FaRedo,
  FaExpand,
  FaCompress,
  FaSave,
} from 'react-icons/fa';

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

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
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
  const isPanTool = tool === 'pan';

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 px-4 py-3 flex flex-wrap items-center justify-center gap-2">
      <button
        onClick={() => {
          onToolChange('draw');
          onStartDrawing();
        }}
        className={`p-3 rounded-lg transition flex items-center gap-2 ${
          isDrawTool && isDrawing
            ? 'bg-blue-600 text-white'
            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
        }`}
        title="Draw Polygon - Click on canvas to add points"
      >
        <FaPencilAlt size={16} />
        <span className="text-xs hidden sm:inline">Draw Polygon</span>
        {isDrawTool && isDrawing && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
      </button>

      <button
        onClick={() => onToolChange('pan')}
        className={`p-3 rounded-lg transition flex items-center gap-2 ${
          isPanTool
            ? 'bg-blue-600 text-white'
            : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
        }`}
        title="Pan - Drag to move the image"
      >
        <FaHandPaper size={16} />
        <span className="text-xs hidden sm:inline">Pan</span>
        {isPanTool && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
      </button>

      <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600">
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition"
          title="Zoom In"
        >
          <FaPlus size={14} />
        </button>
        <span className="text-xs text-gray-300 w-12 text-center font-mono">{(zoom * 100).toFixed(0)}%</span>
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition"
          title="Zoom Out"
        >
          <FaMinus size={14} />
        </button>
      </div>

      <button
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className={`p-3 rounded-lg transition flex items-center gap-2 ${
          hasSelection
            ? 'bg-red-700 hover:bg-red-600 text-white'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
        }`}
        title="Delete Selected Polygon"
      >
        <FaTrashAlt size={16} />
        <span className="text-xs hidden sm:inline">Delete</span>
      </button>

      <button
        onClick={onUndo}
        className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center gap-2"
        title="Undo Last Point"
      >
        <FaUndo size={16} />
        <span className="text-xs hidden sm:inline">Undo</span>
      </button>

      <button
        onClick={onRedo}
        className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center gap-2"
        title="Redo"
      >
        <FaRedo size={16} />
        <span className="text-xs hidden sm:inline">Redo</span>
      </button>

      <button
        onClick={onResetView}
        className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center gap-2"
        title="Reset View"
      >
        <FaExpand size={16} />
        <span className="text-xs hidden sm:inline">Reset</span>
      </button>

      <button
        onClick={onFullscreen}
        className="p-3 rounded-lg bg-gray-600 hover:bg-gray-500 text-gray-200 transition flex items-center gap-2"
        title="Fullscreen"
      >
        <FaCompress size={16} />
        <span className="text-xs hidden sm:inline">Fullscreen</span>
      </button>

      {isDrawing && hasCurrentPolygon && (
        <button
          onClick={onSaveAnnotation}
          className="p-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition font-semibold flex items-center gap-2"
          title="Finish Polygon"
        >
          <FaSave size={16} />
          <span className="text-xs hidden sm:inline">Finish Polygon</span>
        </button>
      )}

      {isDrawing && (
        <button
          onClick={onStopDrawing}
          className="p-3 rounded-lg bg-red-600 hover:bg-red-500 text-white transition font-semibold flex items-center gap-2"
          title="Cancel Drawing"
        >
          <span className="text-xs">Cancel</span>
        </button>
      )}
    </div>
  );
};
