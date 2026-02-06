import React from 'react';
import { Sparkles, History, Github } from 'lucide-react';

interface HeaderProps {
    onShowHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowHistory }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border-b border-white/10"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl border border-white/20 shadow-xl">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Factura<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span>
                        </h1>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">EXTRACTOR INTELIGENTE</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onShowHistory}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
                    >
                        <History className="w-4 h-4" />
                        <span className="text-sm font-medium">Historial</span>
                    </button>

                    <div className="w-px h-8 bg-white/10"></div>

                    <a href="#" className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </header>
    );
};
