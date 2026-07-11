import React, { useEffect, useState } from 'react';
import { useMedicalAnnotation } from '../../hooks/useMedicalAnnotation';
import { MedicalAnnotationCanvas } from '../../components/MedicalAnnotationCanvas';
import { AnnotateTopToolbar } from '../../components/AnnotateTopToolbar';
import { AnnotateBottomToolbar } from '../../components/AnnotateBottomToolbar';
import { UploadPanel } from '../../components/MedicalUploadPanel';
import { AnnotationsSidebar } from '../../components/AnnotationsSidebar';
import { ConfirmDialog } from '../../components/ConfirmDialog';

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

  const [isDeleteImageConfirmOpen, setIsDeleteImageConfirmOpen] = useState(false);

  const handleDeleteCurrentImage = () => {
    if (!annotation.currentImage) return;
    setIsDeleteImageConfirmOpen(true);
  };

  const confirmDeleteCurrentImage = async () => {
    if (!annotation.currentImage) return;
    await annotation.deleteImage(annotation.currentImage.id);
    setIsDeleteImageConfirmOpen(false);
  };

  const cancelDeleteCurrentImage = () => {
    setIsDeleteImageConfirmOpen(false);
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
    <div id="annotation-container" className={`h-full w-full overflow-hidden bg-slate-900 text-slate-100 font-sans flex flex-col ${isFullscreen ? '' : ''}`}>
      {annotation.error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg shadow-rose-500/25 border border-rose-400/30">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{annotation.error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 border border-emerald-400/30">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <AnnotateTopToolbar
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

      <main className="flex-1 min-h-0 w-full overflow-hidden">
        <section className="flex-1 flex flex-col bg-slate-950 p-4 relative min-w-0">
          <div className="flex-1 flex items-center justify-center relative min-h-0 w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-800">
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

          <footer className="h-14 mt-4 bg-slate-800 border border-slate-700 rounded-xl px-4 flex items-center justify-between shrink-0 gap-4 overflow-x-auto select-none">
            <AnnotateBottomToolbar
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
          </footer>
        </section>

        {showSidebar && (
          <aside className="w-80 border-l border-slate-700 bg-slate-800 flex flex-col shrink-0">
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
          </aside>
        )}
      </main>

      {annotation.loading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
            <div className="animate-spin inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full"></div>
            <p className="text-white mt-4 font-medium">Processing...</p>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteImageConfirmOpen}
        title="Delete current image"
        description="Delete the current image and all annotations. This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteCurrentImage}
        onCancel={cancelDeleteCurrentImage}
      />
    </div>
  );
};
