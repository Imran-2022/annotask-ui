'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Annotation, ShapeType, UserPresence } from '@/types';

interface AdvancedAnnotationCanvasProps {
  imageSrc: string;
  annotations: Annotation[];
  selectedAnnotations: string[];
  activeUsers: UserPresence[];
  currentTool: ShapeType;
  color: string;
  opacity: number;
  strokeWidth: number;
  zoomLevel: number;
  onAnnotationCreate?: (annotation: Partial<Annotation>) => void;
  onAnnotationSelect?: (annotationId: string) => void;
  onAnnotationDeselect?: (annotationId: string) => void;
  onZoomChange?: (zoom: number) => void;
  onPan?: (x: number, y: number) => void;
  readOnly?: boolean;
}

interface DrawingState {
  isDrawing: boolean;
  points: Array<{ x: number; y: number }>;
  startPoint?: { x: number; y: number };
  isPanning: boolean;
  panStart?: { x: number; y: number };
}

export const AdvancedAnnotationCanvas: React.FC<AdvancedAnnotationCanvasProps> = ({
  imageSrc,
  annotations,
  selectedAnnotations,
  activeUsers,
  currentTool,
  color,
  opacity,
  strokeWidth,
  zoomLevel,
  onAnnotationCreate,
  onAnnotationSelect,
  onAnnotationDeselect,
  onZoomChange,
  onPan,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    points: [],
    isPanning: false,
  });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Transform canvas coordinates to image coordinates
  const getImageCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100 / zoomLevel;
    const y = ((clientY - rect.top) / rect.height) * 100 / zoomLevel;

    return { x, y };
  }, [zoomLevel]);

  // Handle mouse down
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;

    const { x, y } = getImageCoordinates(event.clientX, event.clientY);

    if (event.button === 2) {
      // Right-click: pan
      setDrawingState(prev => ({
        ...prev,
        isPanning: true,
        panStart: { x: event.clientX, y: event.clientY }
      }));
    } else {
      // Left-click: draw
      setDrawingState(prev => ({
        ...prev,
        isDrawing: true,
        startPoint: { x, y },
        points: currentTool === 'freehand' ? [{ x, y }] : [{ x, y }]
      }));
    }
  }, [getImageCoordinates, readOnly, currentTool]);

  // Handle mouse move
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing && !drawingState.isPanning) return;

    const { x, y } = getImageCoordinates(event.clientX, event.clientY);

    if (drawingState.isPanning && drawingState.panStart) {
      const deltaX = event.clientX - drawingState.panStart.x;
      const deltaY = event.clientY - drawingState.panStart.y;
      const newPanOffset = {
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY
      };
      setPanOffset(newPanOffset);
      onPan?.(newPanOffset.x, newPanOffset.y);
    } else if (drawingState.isDrawing) {
      if (currentTool === 'freehand') {
        setDrawingState(prev => ({
          ...prev,
          points: [...prev.points, { x, y }]
        }));
      } else if (['line', 'rectangle', 'circle'].includes(currentTool)) {
        setDrawingState(prev => ({
          ...prev,
          points: prev.startPoint ? [prev.startPoint, { x, y }] : [{ x, y }]
        }));
      }
    }

    redrawCanvas();
  }, [drawingState, panOffset, getImageCoordinates, currentTool, onPan]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (drawingState.isDrawing && drawingState.points.length > 1) {
      onAnnotationCreate?.({
        shape_type: currentTool,
        shape_data: { points: drawingState.points },
        label_class: 'other',
        color,
        opacity,
        stroke_width: strokeWidth
      });
    }

    setDrawingState({
      isDrawing: false,
      points: [],
      isPanning: false,
    });
  }, [drawingState, currentTool, color, opacity, strokeWidth, onAnnotationCreate]);

  // Handle wheel zoom
  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(5, zoomLevel * delta));
    onZoomChange?.(newZoom);
  }, [zoomLevel, onZoomChange]);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Save context
    ctx.save();

    // Apply pan and zoom
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw image
    ctx.drawImage(imageRef.current, 0, 0, 100, 100);

    // Draw annotations
    annotations.forEach(annotation => {
      const isSelected = selectedAnnotations.includes(annotation.id.toString());
      drawAnnotation(ctx, annotation, isSelected);
    });

    // Draw current drawing
    if (drawingState.isDrawing && drawingState.points.length > 0) {
      drawShape(ctx, currentTool, drawingState.points, color, opacity, strokeWidth, false);
    }

    // Draw active users cursors
    activeUsers.forEach(user => {
      // Placeholder for user cursor indicators
    });

    ctx.restore();
  }, [annotations, selectedAnnotations, drawingState, color, opacity, strokeWidth, currentTool, panOffset, zoomLevel, activeUsers]);

  const drawAnnotation = (
    ctx: CanvasRenderingContext2D,
    annotation: Annotation,
    isSelected: boolean
  ) => {
    const drawOpacity = isSelected ? 0.7 : annotation.opacity ?? opacity;
    const strokeColor = isSelected ? '#2563eb' : annotation.color;

    // Draw based on shape type
    if (annotation.shape_data?.points && annotation.shape_type) {
      drawShape(
        ctx,
        annotation.shape_type,
        annotation.shape_data.points,
        annotation.color || color,
        drawOpacity,
        annotation.stroke_width ?? strokeWidth,
        isSelected
      );
    }

    // Draw lock indicator if locked
    if (annotation.is_locked && annotation.shape_data?.points) {
      const firstPoint = annotation.shape_data.points[0];
      if (firstPoint) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(firstPoint.x - 2, firstPoint.y - 2, 4, 4);
      }
    }
  };

  const drawShape = (
    ctx: CanvasRenderingContext2D,
    shapeType: ShapeType,
    points: Array<{ x: number; y: number }>,
    color: string,
    opacity: number,
    strokeWidth: number,
    isSelected: boolean
  ) => {
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = isSelected ? '#2563eb' : color;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = color;

    switch (shapeType) {
      case 'polygon':
        if (points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.stroke();
          ctx.globalAlpha = opacity * 0.5;
          ctx.fill();
        }
        break;

      case 'line':
        if (points.length === 2) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
          ctx.stroke();
        }
        break;

      case 'circle':
        if (points.length === 2) {
          const radius = Math.hypot(
            points[1].x - points[0].x,
            points[1].y - points[0].y
          );
          ctx.beginPath();
          ctx.arc(points[0].x, points[0].y, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = opacity * 0.5;
          ctx.fill();
        }
        break;

      case 'rectangle':
        if (points.length === 2) {
          ctx.strokeRect(
            Math.min(points[0].x, points[1].x),
            Math.min(points[0].y, points[1].y),
            Math.abs(points[1].x - points[0].x),
            Math.abs(points[1].y - points[0].y)
          );
          ctx.globalAlpha = opacity * 0.5;
          ctx.fillRect(
            Math.min(points[0].x, points[1].x),
            Math.min(points[0].y, points[1].y),
            Math.abs(points[1].x - points[0].x),
            Math.abs(points[1].y - points[0].y)
          );
        }
        break;

      case 'freehand':
        if (points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          points.forEach(p => ctx.lineTo(p.x, p.y));
          ctx.stroke();
        }
        break;

      case 'point':
        if (points.length >= 1) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(points[0].x, points[0].y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }

    ctx.globalAlpha = 1;
  };

  // Initial render
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-gray-700">
      {/* Image reference (hidden) */}
      <img
        ref={imageRef}
        src={imageSrc}
        alt="annotation-reference"
        style={{ display: 'none' }}
      />

      {/* Canvas for drawing */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => e.preventDefault()}
      />

      {/* Active users indicator */}
      {activeUsers.length > 0 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 p-2 rounded text-sm text-white">
          <p className="font-semibold">Active: {activeUsers.length}</p>
          {activeUsers.slice(0, 3).map(user => (
            <p key={user.id} className="text-xs text-green-400">• {user.user_email}</p>
          ))}
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 p-2 rounded text-sm text-white">
        <p>Zoom: {(zoomLevel * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
};
