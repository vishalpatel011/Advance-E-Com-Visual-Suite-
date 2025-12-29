import React, { useCallback, useState } from 'react';
import { Upload, FileImage, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative w-full max-w-2xl mx-auto h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6
        ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'}
        ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'opacity-100'}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        onChange={handleChange}
        accept="image/*"
        disabled={isAnalyzing}
      />
      
      {isAnalyzing ? (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="text-indigo-200 font-medium">Analyzing Product & Context...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-xl">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Upload Product Image</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              Drag & drop your raw product shot here, or click to browse. 
              Supports PNG, JPG, WEBP.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
