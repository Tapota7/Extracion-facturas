import React, { useRef, useEffect } from 'react';
import { ExtractionStatus } from '../../types';
import { Sparkles, Scan, AlertCircle, FileImage } from 'lucide-react';

interface InvoicePreviewProps {
    imagePreview: string | null;
    status: ExtractionStatus;
    onExtract: () => void;
    error?: string | null;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
    imagePreview,
    status,
    onExtract,
    error
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    if (!imagePreview) return null;

    return (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-700">
            <div className="glass-card rounded-2xl overflow-hidden relative group">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white/90 font-medium text-sm backdrop-blur-md px-3 py-1 rounded-full bg-white/10 border border-white/10">
                        <FileImage className="w-4 h-4" />
                        <span>Vista Previa</span>
                    </div>
                </div>

                {/* Image Container */}
                <div ref={containerRef} className="aspect-[3/4] bg-slate-950 relative overflow-hidden">
                    <img
                        src={imagePreview}
                        alt="Factura"
                        className={`w-full h-full object-contain transition-all duration-700 ${status === 'loading' ? 'opacity-50 scale-[0.98] blur-[2px]' : 'opacity-100'}`}
                    />

                    {/* Scanning Animation Beam */}
                    {status === 'loading' && (
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.8)] animate-scan relative">
                                <div className="absolute top-0 right-0 py-1 px-2 text-[10px] font-bold text-indigo-300 bg-indigo-900/80 rounded-bl-lg">
                                    ANALIZANDO...
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                        </div>
                    )}
                </div>

                {/* Extract Action Overlay (Only visible if not extracted yet or needs retry) */}
                {status !== 'loading' && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent flex flex-col items-center">

                        <button
                            onClick={onExtract}
                            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 group/btn border border-indigo-400/30"
                        >
                            <div className="relative">
                                <Sparkles className="w-5 h-5 absolute inset-0 text-white blur-sm animate-pulse" />
                                <Sparkles className="w-5 h-5 relative text-white" />
                            </div>
                            <span>{status === 'success' ? 'Volver a Extraer' : 'Extraer Datos con IA'}</span>
                            <div className="w-px h-4 bg-white/20 mx-1"></div>
                            <Scan className="w-5 h-5 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
                        </button>

                        {status === 'idle' && (
                            <p className="text-slate-400 text-xs mt-3 text-center">
                                Procesado seguro por Gemini 1.5 Flash
                            </p>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-200 text-sm animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};
