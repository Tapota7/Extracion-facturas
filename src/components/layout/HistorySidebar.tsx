import React from 'react';
import { InvoiceData } from '../../types';
import { X, FileText, Trash2, Download } from 'lucide-react';

interface HistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    history: InvoiceData[];
    onSelect: (invoice: InvoiceData) => void;
    onDelete: (index: number) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
    isOpen,
    onClose,
    history,
    onSelect,
    onDelete
}) => {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Panel */}
            <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-[#0f172a] border-l border-white/10 shadow-2xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            Historial de Facturas
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {history.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No hay facturas guardadas aún.</p>
                            </div>
                        ) : (
                            history.map((invoice, index) => (
                                <div
                                    key={index}
                                    className="group bg-white/5 border border-white/5 hover:border-indigo-500/50 rounded-xl p-4 transition-all hover:bg-white/10"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div onClick={() => { onSelect(invoice); onClose(); }} className="cursor-pointer flex-1">
                                            <h4 className="text-white font-medium truncate">{invoice.vendorName || 'Proveedor Desconocido'}</h4>
                                            <p className="text-xs text-slate-400 mt-1">Factura: {invoice.invoiceNumber || 'N/A'}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                            className="text-slate-500 hover:text-red-400 p-1 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div
                                        onClick={() => { onSelect(invoice); onClose(); }}
                                        className="flex justify-between items-center mt-3 cursor-pointer"
                                    >
                                        <span className="text-xs text-slate-500">{invoice.date}</span>
                                        <span className="text-sm font-bold text-indigo-300">
                                            ${invoice.totalAmount?.toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
