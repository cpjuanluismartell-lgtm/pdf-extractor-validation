import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files[0].type === 'application/pdf') {
        onFileSelect(e.dataTransfer.files[0]);
      } else {
        alert('Please upload a valid PDF file.');
      }
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);

  const dropzoneClasses = `
    w-full max-w-2xl mx-auto border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
    ${isDragging ? 'border-red-400 bg-red-50 scale-105' : 'border-gray-300 hover:border-red-400 hover:bg-gray-50'}
  `;

  return (
    <div
      className={dropzoneClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload-input')?.click()}
    >
      <input
        type="file"
        id="file-upload-input"
        className="hidden"
        accept="application/pdf"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-xl font-semibold text-gray-700">
          <span className="text-red-600">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-sm">a PDF file to get started</p>
      </div>
    </div>
  );
};
