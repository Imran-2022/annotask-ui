import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage, Group, Circle, Line } from 'react-konva';
import { Annotation } from '../services/medicalService';

interface AnnotationCanvasProps {
  imageUrl: string | null;
  annotations: Annotation[];
  currentPoints: Array<{ x: number; y: number }>;
  zoom: number;
  panX: number;
  panY: number;
  isDrawing: boolean;
  tool: 'draw' | 'pan' | 'select';
  selectedAnnotationId: number | null;
  hideAnnotations: boolean;
  hidePreviousAnnotations: boolean;
  applyWindow: boolean;
  onAddPoint: (x: number, y: number) => void;
  onClosePolygon: () => void;
  onDeleteAnnotation: (id: number) => void;
  onSelectAnnotation: (id: number | null) => void;
  onUpdateAnnotation: (id: number, points: Array<{ x: number; y: number }>) => void;
  onMoveAnnotation: (id: number, dx: number, dy: number) => void;
  onPan: (dx: number, dy: number) => void;
  onZoom: (newZoom: number, x: number, y: number) => void;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const getAnnotationColor = (index: number): string => {
  return COLORS[index % COLORS.length];
};

export const MedicalAnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  imageUrl,
  annotations,
  currentPoints,
  zoom,
  panX,
  panY,
  isDrawing,
  tool,
  selectedAnnotationId,
  hideAnnotations,
  hidePreviousAnnotations,
  applyWindow,
  onAddPoint,
  onClosePolygon,
  onDeleteAnnotation,
  onSelectAnnotation,
  onUpdateAnnotation,
  onMoveAnnotation,
  onPan,
  onZoom,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const isPanning = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      setLoadError(null);
      return;
    }

    const img = new Image();
    setLoadError(null);
    img.onload = () => setImage(img);
    img.onerror = () => {
      console.error('Failed to load image', imageUrl);
      setImage(null);
      setLoadError('Unable to load the image. Please check your backend media URL or CORS configuration.');
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    const handleResize = () => {
      const container = stageRef.current?.container();
      if (container) {
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const container = stageRef.current?.container();
    if (container) {
      setStageSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    }
  }, [imageUrl]);

  // Scale to cover the available area (fill width or height) to reduce large empty gaps for banner-like images.
  // This chooses the larger scale so the image fills at least one dimension; it may crop along the other axis.
  const imageScale = image
    ? Math.max(stageSize.width / image.width, stageSize.height / image.height)
    : 1;
  const imageWidth = image ? image.width * imageScale : 0;
  const imageHeight = image ? image.height * imageScale : 0;
  const offsetX = (stageSize.width - imageWidth) / 2;
  const offsetY = (stageSize.height - imageHeight) / 2;
  const groupScale = imageScale * zoom;

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'pan') {
      isPanning.current = true;
      lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    const localX = (pointerPos.x - offsetX - panX) / groupScale;
    const localY = (pointerPos.y - offsetY - panY) / groupScale;

    if (tool === 'select') {
      for (let i = annotations.length - 1; i >= 0; i--) {
        const annotation = annotations[i];
        if (isPointInPolygon({ x: localX, y: localY }, annotation.polygon_points)) {
          onSelectAnnotation(annotation.id);
          return;
        }
      }

      onSelectAnnotation(null);
      return;
    }

    if (tool === 'draw' && isDrawing) {
      if (currentPoints.length > 2) {
        const firstPoint = currentPoints[0];
        const distance = Math.hypot(localX - firstPoint.x, localY - firstPoint.y);
        if (distance < 10 / groupScale) {
          onClosePolygon();
          return;
        }
      }

      // Prevent duplicate points (too close to last point)
      if (currentPoints.length > 0) {
        const lastPoint = currentPoints[currentPoints.length - 1];
        const distance = Math.hypot(localX - lastPoint.x, localY - lastPoint.y);
        if (distance < 5 / groupScale) {
          // Silently ignore too-close clicks
          return;
        }
      }

      onAddPoint(localX, localY);
    }
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'pan' && isPanning.current) {
      const dx = e.evt.clientX - lastPosRef.current.x;
      const dy = e.evt.clientY - lastPosRef.current.y;
      onPan(dx, dy);
      lastPosRef.current = { x: e.evt.clientX, y: e.evt.clientY };
    }
  };

  const handleStageMouseUp = () => {
    isPanning.current = false;
  };

  const handleStageDoubleClick = () => {
    if (tool === 'draw' && currentPoints.length >= 3) {
      onClosePolygon();
    }
  };

  const isPointInPolygon = (point: { x: number; y: number }, polygon: Array<{ x: number; y: number }>): boolean => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = zoom;
    const newScale = e.evt.deltaY > 0 ? Math.max(oldScale / scaleBy, 0.5) : Math.min(oldScale * scaleBy, 5);
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - panX - offsetX) / oldScale,
      y: (pointer.y - panY - offsetY) / oldScale,
    };

    const newPos = {
      x: pointer.x - offsetX - mousePointTo.x * newScale,
      y: pointer.y - offsetY - mousePointTo.y * newScale,
    };

    onZoom(newScale, newPos.x + offsetX, newPos.y + offsetY);
  };

  const shouldShowAnnotations = !hideAnnotations;
  const filteredAnnotations = hidePreviousAnnotations ? [] : annotations;

  return (
    <div className="relative w-full h-full min-h-[32rem] bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm px-6 text-center">
          {loadError ? (
            <div>
              <p className="font-semibold text-rose-300">{loadError}</p>
              <p className="mt-2 text-sm text-slate-400">Try reloading or check the backend media URL.</p>
            </div>
          ) : (
            'Upload images to start annotating. Use draw mode to place polygon points.'
          )}
        </div>
      )}

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onDblClick={handleStageDoubleClick}
        onWheel={handleWheel}
        style={{ cursor: tool === 'pan' ? 'grab' : tool === 'draw' ? 'crosshair' : 'pointer' }}
      >
        <Layer ref={layerRef}>
          <Group x={offsetX + panX} y={offsetY + panY} scaleX={groupScale} scaleY={groupScale}>
            {image && (
              <KonvaImage
                image={image}
                width={image.width}
                height={image.height}
                filters={applyWindow ? [Konva.Filters.Brighten, Konva.Filters.Contrast] : []}
                brightness={applyWindow ? 0.08 : 0}
                contrast={applyWindow ? 0.12 : 0}
              />
            )}

            {shouldShowAnnotations &&
              filteredAnnotations.map((annotation, idx) => (
                <React.Fragment key={annotation.id}>
                  <Line
                    points={annotation.polygon_points.flatMap((p) => [p.x, p.y])}
                    closed
                    fill={selectedAnnotationId === annotation.id ? 'rgba(59,130,246,0.25)' : `${getAnnotationColor(idx)}33`}
                    opacity={1}
                    stroke={selectedAnnotationId === annotation.id ? '#38bdf8' : getAnnotationColor(idx)}
                    strokeWidth={selectedAnnotationId === annotation.id ? 3 : 2}
                    perfectDrawEnabled
                    onClick={() => onSelectAnnotation(annotation.id)}
                    onDragEnd={(e) => {
                      const dx = e.target.x();
                      const dy = e.target.y();
                      if (dx !== 0 || dy !== 0) {
                        onMoveAnnotation(annotation.id, dx, dy);
                      }
                      e.target.position({ x: 0, y: 0 });
                    }}
                    draggable={selectedAnnotationId === annotation.id}
                  />

                  {selectedAnnotationId === annotation.id &&
                    annotation.polygon_points.map((point, pidx) => (
                      <Circle
                        key={`vertex-${annotation.id}-${pidx}`}
                        x={point.x}
                        y={point.y}
                        radius={6}
                        fill="#fff"
                        stroke={getAnnotationColor(idx)}
                        strokeWidth={2}
                        draggable
                        onDragEnd={(e) => {
                          const position = e.target.position();
                          const updatedPoints = annotation.polygon_points.map((pt, index) =>
                            index === pidx ? { x: position.x, y: position.y } : pt
                          );
                          onUpdateAnnotation(annotation.id, updatedPoints);
                        }}
                      />
                    ))}
                </React.Fragment>
              ))}

            {isDrawing && currentPoints.length > 0 && (
              <>
                {currentPoints.length > 1 && (
                  <Line
                    points={currentPoints.flatMap((p) => [p.x, p.y])}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                {currentPoints.map((point, idx) => (
                  <Circle key={`current-${idx}`} x={point.x} y={point.y} radius={5} fill="#3b82f6" />
                ))}
              </>
            )}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
};
