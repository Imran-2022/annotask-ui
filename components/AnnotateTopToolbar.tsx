import React from 'react';

interface TopToolbarProps {
  currentImageIndex: number;
  totalImages: number;
  hideAnnotations: boolean;
  onHideAnnotationsChange: (hide: boolean) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onBack?: () => void;
  onUpload?: (files: File[]) => void;
  onDeleteImage?: () => void;
  hasImage?: boolean;
  isImageAvailable?: boolean;
}

export const AnnotateTopToolbar: React.FC<TopToolbarProps> = ({
  currentImageIndex,
  totalImages,
  hideAnnotations,
  onHideAnnotationsChange,
  onPrevImage,
  onNextImage,
  onBack,
  onUpload,
  onDeleteImage,
  hasImage = false,
  isImageAvailable = true,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const isDisabled = !isImageAvailable;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <header className="h-14 border-b border-slate-700 bg-slate-800 px-4 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-700 rounded-md overflow-hidden">
          <button
            onClick={onPrevImage}
            disabled={isDisabled}
            className={`px-3 py-1.5 border-r border-slate-600 transition text-sm ${isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'hover:bg-slate-600'}`}
            title="Previous Image"
          >
            &lsaquo;
          </button>
          <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-slate-100">Axial ({currentImageIndex + 1}/{totalImages})</span>
          <button
            onClick={onNextImage}
            disabled={isDisabled}
            className={`px-3 py-1.5 border-l border-slate-600 transition text-sm ${isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'hover:bg-slate-600'}`}
            title="Next Image"
          >
            &rsaquo;
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300 ml-2">
          <label className={`flex items-center gap-1.5 ${isDisabled ? 'cursor-not-allowed text-slate-500' : 'cursor-pointer'}`} title="Toggle visibility for all annotations on the current image">
            <input
              type="checkbox"
              checked={hideAnnotations}
              onChange={(e) => onHideAnnotationsChange(e.target.checked)}
              disabled={isDisabled}
              className="rounded accent-blue-500"
            />
            Hide all annotations
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md text-xs font-medium transition text-slate-100"
          >
            Back to Tasks
          </button>
        )}

        {onUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-md text-xs font-medium transition text-white"
            >
              Upload
            </button>
          </>
        )}

        {onDeleteImage && (
          <button
            onClick={onDeleteImage}
            disabled={!hasImage}
            className={`bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white px-3 py-1.5 rounded-md text-xs font-medium transition ${
              hasImage ? '' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Delete Image
          </button>
        )}
      </div>
    </header>
  );
};
