import { useState, useCallback, useRef, useEffect } from 'react';
import { MedicalImage, Annotation, medicalImageService, annotationService } from '../services/medicalService';

interface DrawingState {
  isDrawing: boolean;
  currentPoints: Array<{ x: number; y: number }>;
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
}

export const useMedicalAnnotation = () => {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    currentPoints: [],
  });
  
  const [canvas, setCanvas] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  
  const [tool, setTool] = useState<'draw' | 'pan' | 'select'>('select');
  const [label, setLabel] = useState<'tumor' | 'organ' | 'vessel' | 'other'>('tumor');
  const [hideAnnotations, setHideAnnotations] = useState(false);
  const [hidePreviousAnnotations, setHidePreviousAnnotations] = useState(false);
  const [applyWindow, setApplyWindow] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<number | null>(null);
  
  const historyRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const redoStackRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const activeImageIdRef = useRef<number | null>(null);
  
  const currentImage = images[currentImageIndex];
  
  const loadAnnotations = useCallback(async (imageId: number) => {
    activeImageIdRef.current = imageId;
    try {
      setError(null);
      const data = await annotationService.getAnnotations(imageId);
      if (activeImageIdRef.current !== imageId) return;
      setAnnotations(data);
      setSelectedAnnotationId(null);
      setDrawing({ isDrawing: false, currentPoints: [] });
    } catch (err) {
      if (activeImageIdRef.current !== imageId) return;
      setError(err instanceof Error ? err.message : 'Failed to load annotations');
    }
  }, []);

  useEffect(() => {
    if (!currentImage) return;
    setAnnotations([]);
    setSelectedAnnotationId(null);
    setDrawing({ isDrawing: false, currentPoints: [] });
    historyRef.current = [];
    redoStackRef.current = [];
    loadAnnotations(currentImage.id);
  }, [currentImage, loadAnnotations]);

  useEffect(() => {
    if (!currentImage) return;
    setCanvas({ zoom: 1, panX: 0, panY: 0 });
  }, [currentImage?.id]);
  
  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await medicalImageService.getImages();
      setImages(data);
      if (data.length > 0) {
        setCurrentImageIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const uploadImages = useCallback(async (files: File[]) => {
    try {
      setLoading(true);
      setError(null);
      const uploaded = await medicalImageService.uploadImages(files);
      setImages(prev => [...prev, ...uploaded]);
      if (images.length === 0 && uploaded.length > 0) {
        setCurrentImageIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
    } finally {
      setLoading(false);
    }
  }, [images.length]);
  
  const navigateImage = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else if (direction === 'prev' && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  }, [currentImageIndex, images.length]);
  
  const addPoint = useCallback((x: number, y: number) => {
    setDrawing(prev => {
      historyRef.current.push(prev.currentPoints);
      redoStackRef.current = [];
      return {
        ...prev,
        currentPoints: [...prev.currentPoints, { x, y }],
      };
    });
  }, []);
  
  const saveAnnotation = useCallback(async () => {
    if (drawing.currentPoints.length < 3 || !currentImage) return;
    try {
      setLoading(true);
      setError(null);
      const newAnnotation = await annotationService.createAnnotation(
        currentImage.id,
        label,
        drawing.currentPoints
      );
      setAnnotations(prev => [...prev, newAnnotation]);
      setDrawing({ isDrawing: false, currentPoints: [] });
      setSelectedAnnotationId(null);
      historyRef.current = [];
      redoStackRef.current = [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save annotation');
    } finally {
      setLoading(false);
    }
  }, [drawing.currentPoints, currentImage, label]);
  
  const undoLastPoint = useCallback(() => {
    setDrawing(prev => {
      if (historyRef.current.length === 0) return prev;
      const lastState = historyRef.current.pop();
      if (!lastState) return prev;
      redoStackRef.current.push(prev.currentPoints);
      return {
        ...prev,
        currentPoints: lastState,
      };
    });
  }, []);
  
  const redo = useCallback(() => {
    setDrawing(prev => {
      if (redoStackRef.current.length === 0) return prev;
      const nextState = redoStackRef.current.pop();
      if (!nextState) return prev;
      historyRef.current.push(prev.currentPoints);
      return {
        ...prev,
        currentPoints: nextState,
      };
    });
  }, []);
  
  const resetDrawing = useCallback(() => {
    setDrawing({ isDrawing: false, currentPoints: [] });
    historyRef.current = [];
    redoStackRef.current = [];
    setSelectedAnnotationId(null);
  }, []);
  
  const deleteAnnotation = useCallback(async (annotationId: number) => {
    try {
      setLoading(true);
      setError(null);
      await annotationService.deleteAnnotation(annotationId);
      setAnnotations(prev => prev.filter(a => a.id !== annotationId));
      if (selectedAnnotationId === annotationId) {
        setSelectedAnnotationId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete annotation');
    } finally {
      setLoading(false);
    }
  }, [selectedAnnotationId]);
  
  const updateAnnotation = useCallback(async (annotationId: number, polygonPoints: Array<{ x: number; y: number }>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await annotationService.updateAnnotation(annotationId, {
        polygon_points: polygonPoints,
      });
      setAnnotations(prev => prev.map((a) => (a.id === annotationId ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update annotation');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const moveAnnotation = useCallback(async (annotationId: number, dx: number, dy: number) => {
    const annotation = annotations.find((a) => a.id === annotationId);
    if (!annotation) return;
    const movedPoints = annotation.polygon_points.map((point) => ({
      x: point.x + dx,
      y: point.y + dy,
    }));
    await updateAnnotation(annotationId, movedPoints);
  }, [annotations, updateAnnotation]);

  const deleteImage = useCallback(async (imageId: number) => {
    try {
      setLoading(true);
      setError(null);
      await medicalImageService.deleteImage(imageId);
      setImages(prev => {
        const next = prev.filter((img) => img.id !== imageId);
        // adjust current index
        if (next.length === 0) {
          setCurrentImageIndex(0);
        } else {
          setCurrentImageIndex((idx) => Math.max(0, Math.min(idx, next.length - 1)));
        }
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  }, []);
  
  const zoomIn = useCallback(() => {
    setCanvas(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.2, 5),
    }));
  }, []);
  
  const zoomOut = useCallback(() => {
    setCanvas(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.2, 0.5),
    }));
  }, []);
  
  const resetView = useCallback(() => {
    setCanvas({ zoom: 1, panX: 0, panY: 0 });
  }, []);
  
  const pan = useCallback((dx: number, dy: number) => {
    setCanvas(prev => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  }, []);

  const zoomWithFocus = useCallback((newZoom: number, x: number, y: number) => {
    setCanvas({ zoom: newZoom, panX: x, panY: y });
  }, []);
  
  return {
    images,
    currentImage,
    currentImageIndex,
    annotations,
    loading,
    error,
    drawing,
    canvas,
    tool,
    label,
    hideAnnotations,
    hidePreviousAnnotations,
    applyWindow,
    selectedAnnotationId,
    setTool,
    setLabel,
    setHideAnnotations,
    setHidePreviousAnnotations,
    setApplyWindow,
    setSelectedAnnotationId,
    loadImages,
    uploadImages,
    navigateImage,
    addPoint,
    saveAnnotation,
    undoLastPoint,
    redo,
    resetDrawing,
    deleteAnnotation,
    updateAnnotation,
    moveAnnotation,
    deleteImage,
    zoomIn,
    zoomOut,
    resetView,
    pan,
    zoomWithFocus,
    setDrawing,
    setError,
  };
};
