import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`group relative w-full h-80 rounded-2xl transition-all duration-500 flex flex-col items-center justify-center p-8 overflow-hidden
        ${isDragging
          ? 'border-2 border-indigo-400 bg-indigo-500/10 scale-[1.02] shadow-[0_0_40px_rgba(99,102,241,0.3)]'
          : 'border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 hover:border-indigo-500/50'
        } 
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        type="file"
        id="file-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
        onChange={handleChange}
        accept="image/*"
        disabled={isLoading}
      />

      {/* Background Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-4">
        <div className={`p-5 rounded-full bg-slate-800/80 border border-white/5 shadow-2xl transition-transform duration-500 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-105'}`}>
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
          ) : (
            <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'} transition-colors duration-300`} />
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isDragging ? '¡Suelta tu factura aquí!' : 'Sube tu Factura'}
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            Arrastra y suelta tu imagen (JPG, PNG) o haz clic para explorar.
          </p>
        </div>

        <div className="flex gap-4 pt-2 opacity-60">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
            <ImageIcon className="w-3 h-3" /> JPG
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
            <ImageIcon className="w-3 h-3" /> PNG
          </div>
        </div>
      </div>
    </div>
  );
};
