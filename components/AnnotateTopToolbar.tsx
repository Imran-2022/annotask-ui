import React from 'react';

interface TopToolbarProps {
  currentImageIndex: number;
  totalImages: number;
  label: 'tumor' | 'organ' | 'vessel' | 'other';
  onLabelChange: (label: 'tumor' | 'organ' | 'vessel' | 'other') => void;
  hideAnnotations: boolean;
  onHideAnnotationsChange: (hide: boolean) => void;
  hidePreviousAnnotations: boolean;
  onHidePreviousAnnotationsChange: (hide: boolean) => void;
  applyWindow: boolean;
  onApplyWindowChange: (apply: boolean) => void;
  onPrevImage: () => void;
  onNextImage: () => void;
  onBack?: () => void;
  onUpload?: (files: File[]) => void;
  onDeleteImage?: () => void;
  hasImage?: boolean;
}

export const AnnotateTopToolbar: React.FC<TopToolbarProps> = ({
  currentImageIndex,
  totalImages,
  label,
  onLabelChange,
  hideAnnotations,
  onHideAnnotationsChange,
  hidePreviousAnnotations,
  onHidePreviousAnnotationsChange,
  applyWindow,
  onApplyWindowChange,
  onPrevImage,
  onNextImage,
  onBack,
  onUpload,
  onDeleteImage,
  hasImage = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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
            className="px-3 py-1.5 hover:bg-slate-600 border-r border-slate-600 transition text-sm"
            title="Previous Image"
          >
            &lsaquo;
          </button>
          <span className="px-3 py-1.5 text-xs font-medium tracking-wide text-slate-100">Axial ({currentImageIndex + 1}/{totalImages})</span>
          <button
            onClick={onNextImage}
            className="px-3 py-1.5 hover:bg-slate-600 border-l border-slate-600 transition text-sm"
            title="Next Image"
          >
            &rsaquo;
          </button>
        </div>

        <select
          value={label}
          onChange={(e) => onLabelChange(e.target.value as any)}
          className="bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100"
        >
          <option value="tumor">Tumor</option>
          <option value="organ">Lesion</option>
          <option value="vessel">Tissue</option>
          <option value="other">Other</option>
        </select>

        <div className="flex items-center gap-4 text-xs text-slate-300 ml-2">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hideAnnotations}
              onChange={(e) => onHideAnnotationsChange(e.target.checked)}
              className="rounded accent-blue-500"
            />
            Hide Annotations
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hidePreviousAnnotations}
              onChange={(e) => onHidePreviousAnnotationsChange(e.target.checked)}
              className="rounded accent-blue-500"
            />
            Hide Previous
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={applyWindow}
              onChange={(e) => onApplyWindowChange(e.target.checked)}
              className="rounded accent-blue-500"
            />
            Apply CT Window
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
