import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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

export const MedicalTopToolbar: React.FC<TopToolbarProps> = ({
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
    <div className="bg-white text-slate-900 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onPrevImage}
          disabled={currentImageIndex === 0}
          className="px-3 py-2 border border-slate-300 bg-white text-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Image"
        >
          <FaChevronLeft size={18} />
        </button>
        <div className="text-sm font-mono px-3 py-2 border border-slate-300 bg-slate-50 text-slate-900">
          Axial ({currentImageIndex + 1}/{totalImages})
        </div>
        <button
          onClick={onNextImage}
          disabled={currentImageIndex === totalImages - 1}
          className="px-3 py-2 border border-slate-300 bg-white text-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Image"
        >
          <FaChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={label}
          onChange={(e) => onLabelChange(e.target.value as any)}
          className="px-3 py-2 border border-slate-300 bg-white text-slate-900 focus:outline-none"
        >
          <option value="tumor">Tumor</option>
          <option value="organ">Organ</option>
          <option value="vessel">Vessel</option>
          <option value="other">Other</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-slate-900">
          <input
            type="checkbox"
            checked={hideAnnotations}
            onChange={(e) => onHideAnnotationsChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Hide Annotations</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-900">
          <input
            type="checkbox"
            checked={hidePreviousAnnotations}
            onChange={(e) => onHidePreviousAnnotationsChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Hide Previous Annotations</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-slate-900">
          <input
            type="checkbox"
            checked={applyWindow}
            onChange={(e) => onApplyWindowChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Apply CT Window</span>
        </label>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-slate-300 bg-white text-slate-900"
          >
            Back to Tasks
          </button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        {onUpload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 border border-slate-300 bg-white text-slate-900"
          >
            Upload
          </button>
        )}

        {onDeleteImage && (
          <button
            onClick={onDeleteImage}
            disabled={!hasImage}
            className={`px-3 py-2 border border-slate-300 bg-white text-slate-900 transition ${
              hasImage ? '' : 'text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            Delete Image
          </button>
        )}
      </div>
    </div>
  );
};
