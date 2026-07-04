'use client';

import React, { useRef } from 'react';
import { AnnotationShape } from '@/types';

interface AnnotationCanvasProps {
  imageSrc: string;
  shapes: AnnotationShape[];
  currentPoints: AnnotationShape['points'];
  selectedShapeId: string | null;
  onCanvasClick: (point: { x: number; y: number }) => void;
  onSelectShape: (shapeId: string) => void;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
  imageSrc,
  shapes,
  currentPoints,
  selectedShapeId,
  onCanvasClick,
  onSelectShape,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }

    // Use SVG coordinate transformation to account for viewBox scaling and preserveAspectRatio
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM?.();
    if (!ctm) return;
    const svgPoint = pt.matrixTransform(ctm.inverse());
    // Clamp to viewBox (0..100)
    const x = Math.max(0, Math.min(100, svgPoint.x));
    const y = Math.max(0, Math.min(100, svgPoint.y));

    onCanvasClick({ x, y });
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black">
      <img src={imageSrc} alt="Annotation" className="w-full h-auto block" />
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        onClick={handleCanvasClick}
      >
        {shapes.map((shape) => (
          <g key={shape.id}>
            <polygon
              points={shape.points.map((point: { x: number; y: number }) => `${point.x},${point.y}`).join(' ')}
              fill={shape.id === selectedShapeId ? 'rgba(59,130,246,0.25)' : 'rgba(16,185,129,0.18)'}
              stroke={shape.id === selectedShapeId ? '#2563eb' : '#10b981'}
              strokeWidth={0.8}
              onClick={(event: React.MouseEvent<SVGPolygonElement>) => {
                event.stopPropagation();
                onSelectShape(shape.id);
              }}
            />
            {shape.points.map((point: { x: number; y: number }, index: number) => (
              <circle
                key={`${shape.id}-${index}`}
                cx={point.x}
                cy={point.y}
                r={1.25}
                fill="#fff"
                stroke={shape.id === selectedShapeId ? '#2563eb' : '#10b981'}
                strokeWidth={0.8}
              />
            ))}
          </g>
        ))}

        {currentPoints.length > 0 && (
          <polyline
            points={currentPoints.map((point) => `${point.x},${point.y}`).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={0.8}
            strokeDasharray="2 2"
          />
        )}

        {currentPoints.map((point, index) => (
          <circle
            key={`current-${index}`}
            cx={point.x}
            cy={point.y}
            r={1.25}
            fill="#f59e0b"
          />
        ))}
      </svg>
    </div>
  );
};
