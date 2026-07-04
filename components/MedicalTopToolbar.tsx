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
  fitMode?: 'cover' | 'contain';
  onFitModeChange?: (mode: 'cover' | 'contain') => void;
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
  fitMode = 'cover',
  onFitModeChange,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && onUpload) {
      onUpload(Array.from(e.target.files));
      e.target.value = '';
    }
  };
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onPrevImage}
          disabled={currentImageIndex === 0}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          title="Previous Image"
        >
          <FaChevronLeft size={18} />
        </button>
        <div className="text-sm font-mono bg-gray-700 px-3 py-2 rounded text-white">
          Axial ({currentImageIndex + 1}/{totalImages})
        </div>
        <button
          onClick={onNextImage}
          disabled={currentImageIndex === totalImages - 1}
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          title="Next Image"
        >
          <FaChevronRight size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <select
          value={label}
          onChange={(e) => onLabelChange(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-blue-500 transition"
        >
          <option value="tumor">Tumor</option>
          <option value="organ">Organ</option>
          <option value="vessel">Vessel</option>
          <option value="other">Other</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer text-white hover:text-blue-400 transition">
          <input
            type="checkbox"
            checked={hideAnnotations}
            onChange={(e) => onHideAnnotationsChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Hide Annotations</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-white hover:text-blue-400 transition">
          <input
            type="checkbox"
            checked={hidePreviousAnnotations}
            onChange={(e) => onHidePreviousAnnotationsChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Hide Previous Annotations</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-white hover:text-blue-400 transition">
          <input
            type="checkbox"
            checked={applyWindow}
            onChange={(e) => onApplyWindowChange(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">Apply CT Window</span>
        </label>
      </div>

      {onBack && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            Back to Tasks
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        {onUpload && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white transition"
          >
            Upload
          </button>
        )}

        {onDeleteImage && (
          <button
            onClick={onDeleteImage}
            disabled={!hasImage}
            className={`px-3 py-2 rounded-lg transition ${
              hasImage ? 'bg-red-700 hover:bg-red-600 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
            }`}
          >
            Delete Image
          </button>
        )}

        {onFitModeChange && (
          <select
            value={fitMode}
            onChange={(e) => onFitModeChange(e.target.value as any)}
            className="px-2 py-2 rounded-lg bg-gray-700 text-white border border-gray-600"
            title="Image fit mode"
          >
            <option value="cover">Fill</option>
            <option value="contain">Fit</option>
          </select>
        )}
      </div>
    </div>
  );
};
