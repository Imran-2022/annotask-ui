'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  Annotation, AnnotationProject, AnnotationLayer, AnnotationComment,
  AnnotationHistory, UserPresence, AnnotationState, ReviewStatus, ShapeType, LabelClass
} from '@/types';
import { collaborationService } from '@/services/collaborationService';
import { wsCollaborationService } from '@/services/wsCollaborationService';

interface AnnotationContextType extends AnnotationState {}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<AnnotationProject | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [layers, setLayers] = useState<AnnotationLayer[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [selectedAnnotations, setSelectedAnnotations] = useState<Annotation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const undoStack = useRef<Annotation[][]>([]);
  const redoStack = useRef<Annotation[][]>([]);
  const wsRef = useRef<typeof wsCollaborationService>(wsCollaborationService);

  // Setup WebSocket listeners
  useEffect(() => {
    const unsubscribers: Array<() => void> = [];

    // Listen for annotation creation
    unsubscribers.push(
      wsRef.current.on('annotation:created', (event) => {
        fetchAnnotations(event.projectId);
      })
    );

    // Listen for annotation updates
    unsubscribers.push(
      wsRef.current.on('annotation:updated', (event) => {
        fetchAnnotations(event.projectId);
      })
    );

    // Listen for annotation deletion
    unsubscribers.push(
      wsRef.current.on('annotation:deleted', (event) => {
        setAnnotations(prev => prev.filter(a => a.id !== event.data.annotation_id));
      })
    );

    // Listen for user presence updates
    unsubscribers.push(
      wsRef.current.on('user:joined', (event) => {
        const user = event.data as UserPresence;
        setActiveUsers(prev => {
          const existing = prev.findIndex(u => u.id === user.id);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = user;
            return updated;
          }
          return [...prev, user];
        });
      })
    );

    // Listen for comment additions
    unsubscribers.push(
      wsRef.current.on('comment:added', (event) => {
        fetchAnnotations(event.projectId);
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const fetchProject = useCallback(async (projectId: number) => {
    try {
      setIsLoading(true);
      const project = await collaborationService.getProject(projectId);
      setCurrentProject(project);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch project';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnnotations = useCallback(async (projectId: number) => {
    try {
      setIsLoading(true);
      const data = await collaborationService.getAnnotations(projectId);
      setAnnotations(data);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch annotations';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchLayers = useCallback(async (projectId: number) => {
    try {
      const data = await collaborationService.getLayers(projectId);
      setLayers(data);
    } catch (err) {
      console.error('Failed to fetch layers:', err);
    }
  }, []);

  const addAnnotation = useCallback(async (annotation: Partial<Annotation>) => {
    try {
      setIsLoading(true);
      const newAnnotation = await collaborationService.createAnnotation({
        ...annotation,
        project: currentProject?.id
      });
      setAnnotations(prev => [...prev, newAnnotation]);
      wsRef.current.notifyAnnotationCreated(newAnnotation.id, newAnnotation);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add annotation';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  const updateAnnotation = useCallback(async (id: number, annotation: Partial<Annotation>) => {
    try {
      setIsLoading(true);
      // Save current state to undo stack
      undoStack.current.push([...annotations]);
      redoStack.current = [];

      const updated = await collaborationService.updateAnnotation(id, annotation);
      setAnnotations(prev => prev.map(a => a.id === id ? updated : a));
      wsRef.current.notifyAnnotationUpdated(id, updated);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update annotation';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [annotations]);

  const deleteAnnotation = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      undoStack.current.push([...annotations]);
      redoStack.current = [];

      await collaborationService.deleteAnnotation(id);
      setAnnotations(prev => prev.filter(a => a.id !== id));
      wsRef.current.notifyAnnotationDeleted(id);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete annotation';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [annotations]);

  const lockAnnotation = useCallback(async (id: number) => {
    try {
      const updated = await collaborationService.lockAnnotation(id);
      setAnnotations(prev => prev.map(a => a.id === id ? updated : a));
      wsRef.current.notifyAnnotationLocked(id);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to lock annotation';
      setError(errorMsg);
    }
  }, []);

  const unlockAnnotation = useCallback(async (id: number) => {
    try {
      const updated = await collaborationService.unlockAnnotation(id);
      setAnnotations(prev => prev.map(a => a.id === id ? updated : a));
      wsRef.current.notifyAnnotationUnlocked(id);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to unlock annotation';
      setError(errorMsg);
    }
  }, []);

  const reviewAnnotation = useCallback(async (id: number, status: ReviewStatus) => {
    try {
      const updated = await collaborationService.reviewAnnotation(id, status);
      setAnnotations(prev => prev.map(a => a.id === id ? updated : a));
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to review annotation';
      setError(errorMsg);
    }
  }, []);

  const selectAnnotation = useCallback((annotation: Annotation) => {
    setSelectedAnnotations(prev => {
      const exists = prev.find(a => a.id === annotation.id);
      return exists ? prev : [...prev, annotation];
    });
  }, []);

  const deselectAnnotation = useCallback((id: number) => {
    setSelectedAnnotations(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAnnotations([]);
  }, []);

  const value: AnnotationContextType = {
    currentProject,
    annotations,
    layers,
    activeUsers,
    selectedAnnotations,
    isLoading,
    error,
    fetchProject,
    fetchAnnotations,
    fetchLayers,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    lockAnnotation,
    unlockAnnotation,
    reviewAnnotation,
    selectAnnotation,
    deselectAnnotation,
    clearSelection,
    setError,
  };

  return (
    <AnnotationContext.Provider value={value}>
      {children}
    </AnnotationContext.Provider>
  );
};

export const useAnnotationContext = () => {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotationContext must be used within AnnotationProvider');
  }
  return context;
};
