import React, { useEffect, useState } from 'react';
import { useMedicalAnnotation } from '../../hooks/useMedicalAnnotation';
import { MedicalAnnotationCanvas } from '../../components/MedicalAnnotationCanvas';
import { MedicalTopToolbar } from '../../components/MedicalTopToolbar';
import { BottomToolbar } from '../../components/MedicalBottomToolbar';
import { UploadPanel } from '../../components/MedicalUploadPanel';
import { AnnotationsSidebar } from '../../components/AnnotationsSidebar';

export const MedicalAnnotationPage: React.FC = () => {
  const annotation = useMedicalAnnotation();
  const [showSidebar, setShowSidebar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  useEffect(() => {
    annotation.loadImages();
  }, []);

  const handleSaveAnnotation = async () => {
    const previousCount = annotation.annotations.length;
    await annotation.saveAnnotation();
    if (annotation.annotations.length > previousCount) {
      setSuccessMessage(`✓ Annotation saved! (${annotation.annotations.length} total)`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleUpload = async (files: File[]) => {
    await annotation.uploadImages(files);
  };

  const handleDeleteCurrentImage = async () => {
    if (!annotation.currentImage) return;
    if (!confirm('Delete current image? This cannot be undone.')) return;
    await annotation.deleteImage(annotation.currentImage.id);
  };

  const handleStartDrawing = () => {
    annotation.setTool('draw');
    annotation.setDrawing({
      isDrawing: true,
      currentPoints: [],
    });
    annotation.setSelectedAnnotationId(null);
  };

  const handleStopDrawing = () => {
    annotation.resetDrawing();
  };

  const handleFullscreen = () => {
    const container = document.getElementById('annotation-container');
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        container.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
        setIsFullscreen(true);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      annotation.navigateImage('next');
    } else if (e.key === 'ArrowLeft') {
      annotation.navigateImage('prev');
    } else if (e.key === 'Escape') {
      annotation.resetDrawing();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [annotation]);

  if (annotation.images.length === 0 && annotation.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm text-center">
          <div className="animate-spin inline-block w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full" />
          <p className="mt-6 text-slate-700 text-lg font-medium">Loading images...</p>
          <p className="mt-2 text-slate-500">Please wait while we prepare your annotation workspace.</p>
        </div>
      </div>
    );
  }

  if (annotation.images.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h1 className="text-4xl font-bold text-slate-900 mb-6">Image Annotation</h1>
            <UploadPanel onUpload={handleUpload} loading={annotation.loading} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="annotation-container"
      className={`flex flex-col h-screen bg-gray-950 ${isFullscreen ? 'p-0' : ''}`}
    >
      {annotation.error && (
        <div className="bg-red-900 text-white px-4 py-2 text-sm">
          Error: {annotation.error}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-sm animate-pulse">
          {successMessage}
        </div>
      )}

      <MedicalTopToolbar
        currentImageIndex={annotation.currentImageIndex}
        totalImages={annotation.images.length}
        label={annotation.label}
        onLabelChange={annotation.setLabel}
        hideAnnotations={annotation.hideAnnotations}
        onHideAnnotationsChange={annotation.setHideAnnotations}
        hidePreviousAnnotations={annotation.hidePreviousAnnotations}
        onHidePreviousAnnotationsChange={annotation.setHidePreviousAnnotations}
        applyWindow={annotation.applyWindow}
        onApplyWindowChange={annotation.setApplyWindow}
        onPrevImage={() => annotation.navigateImage('prev')}
        onNextImage={() => annotation.navigateImage('next')}
        onBack={() => (window.location.href = '/tasks')}
        onUpload={handleUpload}
        onDeleteImage={handleDeleteCurrentImage}
        hasImage={!!annotation.currentImage}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <MedicalAnnotationCanvas
              imageUrl={annotation.currentImage?.file_url || null}
              annotations={annotation.annotations}
              currentPoints={annotation.drawing.currentPoints}
              zoom={annotation.canvas.zoom}
              panX={annotation.canvas.panX}
              panY={annotation.canvas.panY}
              isDrawing={annotation.drawing.isDrawing}
              tool={annotation.tool}
              selectedAnnotationId={annotation.selectedAnnotationId}
              hideAnnotations={annotation.hideAnnotations}
              hidePreviousAnnotations={annotation.hidePreviousAnnotations}
              applyWindow={annotation.applyWindow}
              onAddPoint={annotation.addPoint}
              onClosePolygon={handleSaveAnnotation}
              onDeleteAnnotation={annotation.deleteAnnotation}
              onSelectAnnotation={(id) => {
                annotation.setSelectedAnnotationId(id);
                if (id !== null) {
                  annotation.setTool('select');
                }
              }}
              onUpdateAnnotation={annotation.updateAnnotation}
              onMoveAnnotation={annotation.moveAnnotation}
              onPan={annotation.pan}
              onZoom={annotation.zoomWithFocus}
            />
          </div>

          <BottomToolbar
            tool={annotation.tool}
            onToolChange={annotation.setTool}
            isDrawing={annotation.drawing.isDrawing}
            onStartDrawing={handleStartDrawing}
            onStopDrawing={handleStopDrawing}
            hasCurrentPolygon={annotation.drawing.currentPoints.length >= 3}
            onSaveAnnotation={handleSaveAnnotation}
            onDeleteSelected={() => {
              if (annotation.selectedAnnotationId) {
                annotation.deleteAnnotation(annotation.selectedAnnotationId);
                annotation.setSelectedAnnotationId(null);
              }
            }}
            hasSelection={annotation.selectedAnnotationId !== null}
            onUndo={annotation.undoLastPoint}
            onRedo={annotation.redo}
            onZoomIn={annotation.zoomIn}
            onZoomOut={annotation.zoomOut}
            onResetView={annotation.resetView}
            onFullscreen={handleFullscreen}
            zoom={annotation.canvas.zoom}
          />
        </div>

        {showSidebar && (
          <AnnotationsSidebar
            annotations={annotation.annotations}
            selectedAnnotationId={annotation.selectedAnnotationId}
            onSelectAnnotation={(id) => {
              annotation.setSelectedAnnotationId(id);
              if (id !== null) {
                annotation.setTool('select');
              }
            }}
            onDeleteAnnotation={annotation.deleteAnnotation}
          />
        )}
      </div>

      {annotation.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-white mt-4">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};
