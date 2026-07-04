import React, { useRef, useState } from 'react';
import { FaCloud } from 'react-icons/fa';

interface UploadPanelProps {
  onUpload: (files: File[]) => void;
  loading: boolean;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onUpload, loading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onUpload(imageFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border-2 border-dashed border-gray-600 p-8 text-center hover:border-blue-500 transition">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer py-8 ${isDragging ? 'bg-blue-900 bg-opacity-20' : ''}`}
      >
        <FaCloud size={48} className="mx-auto mb-4 text-gray-500" />
        <h3 className="text-lg font-semibold text-white mb-2">Upload Images</h3>
        <p className="text-gray-400 text-sm mb-2">Drag and drop images here or click to select</p>
        <p className="text-gray-500 text-xs mb-3">Supported formats: PNG, JPG, JPEG, BMP</p>
        <p className="text-blue-400 text-xs font-semibold">💡 Tip: Select multiple images at once. Navigate with Previous/Next buttons.</p>
      </div>

      {loading && (
        <div className="mt-4">
          <div className="animate-spin inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-400 text-sm mt-2">Uploading images...</p>
        </div>
      )}
    </div>
  );
};
