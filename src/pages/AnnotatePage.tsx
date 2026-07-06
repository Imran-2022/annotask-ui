import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicalAnnotation } from '@/hooks/useMedicalAnnotation';
import { MedicalAnnotationCanvas } from '@/components/MedicalAnnotationCanvas';
import { MedicalTopToolbar } from '@/components/MedicalTopToolbar';
import { BottomToolbar } from '@/components/MedicalBottomToolbar';
import { UploadPanel } from '@/components/MedicalUploadPanel';
import { AnnotationsSidebar } from '@/components/AnnotationsSidebar';

export default function AnnotatePage(): React.ReactElement {
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

  const navigate = useNavigate();

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
      className={`min-h-screen bg-slate-50 ${isFullscreen ? 'h-screen' : ''}`}
    >
      {annotation.error && (
        <div className="bg-rose-500/10 text-rose-700 border border-rose-500/20 px-4 py-2 text-sm mx-auto max-w-7xl mt-4 rounded-xl">
          Error: {annotation.error}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 px-4 py-2 text-sm mx-auto max-w-7xl mt-4 rounded-xl">
          {successMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
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
              onBack={() => navigate('/tasks')}
              onUpload={handleUpload}
              onDeleteImage={handleDeleteCurrentImage}
              hasImage={!!annotation.currentImage}
            />

            <div className="flex flex-col lg:flex-row gap-6 p-6">
              <div className="flex-1 flex flex-col min-h-[60vh] overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
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

                <div className="border-t border-slate-800">
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
              </div>

              {showSidebar && (
                <div className="w-full lg:w-80">
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {annotation.loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl shadow-xl text-center">
            <div className="animate-spin inline-block w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full" />
            <p className="text-slate-900 mt-4 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
