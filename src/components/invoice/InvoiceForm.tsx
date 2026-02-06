import React from 'react';
import { InvoiceData, InvoiceLineItem } from '../../types';
import { InvoiceTable } from './InvoiceTable';
import { Download, CheckCircle, FileJson, FileType, RefreshCw } from 'lucide-react';

interface InvoiceFormProps {
    invoice: InvoiceData;
    onUpdateField: (field: keyof InvoiceData, value: string | number) => void;
    onUpdateLineItems: (items: InvoiceLineItem[]) => void;
    onReset: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
    invoice,
    onUpdateField,
    onUpdateLineItems,
    onReset
}) => {

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${invoice.invoiceNumber || 'extract'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadCSV = () => {
        const headers = ['Factura', 'Fecha', 'Proveedor', 'ID Fiscal', 'Monto Total', 'Concepto'];
        const row = [
            invoice.invoiceNumber,
            invoice.date,
            invoice.vendorName,
            invoice.vendorTaxId,
            invoice.totalAmount,
            invoice.generalConcept
        ].join(',');

        const csvContent = [headers.join(','), row].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `factura_${invoice.invoiceNumber || 'extract'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-700 delay-100">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Resultados de la Extracción</h3>
                        <p className="text-xs text-slate-400">Revisa y edita los datos si es necesario</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={downloadJSON}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold bg-slate-800 text-slate-300 border border-white/10 rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <FileJson className="w-4 h-4" /> JSON
                    </button>
                    <button
                        onClick={downloadCSV}
                        className="flex-1 sm:flex-none px-3 py-2 text-xs font-semibold bg-slate-800 text-slate-300 border border-white/10 rounded-lg hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <FileType className="w-4 h-4" /> CSV
                    </button>
                    <button
                        onClick={onReset}
                        className="px-3 py-2 text-xs font-semibold bg-slate-800 text-slate-400 border border-white/10 rounded-lg hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        title="Reset form"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 md:p-8 space-y-8">

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 ml-1">Nº Factura</label>
                            <input
                                type="text"
                                value={invoice.invoiceNumber}
                                onChange={(e) => onUpdateField('invoiceNumber', e.target.value)}
                                className="w-full p-3 glass-input rounded-xl focus:bg-white/10 text-lg font-semibold tracking-wide"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Fecha</label>
                            <input
                                type="text"
                                value={invoice.date}
                                onChange={(e) => onUpdateField('date', e.target.value)}
                                className="w-full p-3 glass-input rounded-xl focus:bg-white/10"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 ml-1">Proveedor</label>
                            <input
                                type="text"
                                value={invoice.vendorName}
                                onChange={(e) => onUpdateField('vendorName', e.target.value)}
                                className="w-full p-3 glass-input rounded-xl focus:bg-white/10 text-lg font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">RUT / ID Fiscal</label>
                            <input
                                type="text"
                                value={invoice.vendorTaxId}
                                onChange={(e) => onUpdateField('vendorTaxId', e.target.value)}
                                className="w-full p-3 glass-input rounded-xl focus:bg-white/10 font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-white/10"></div>

                {/* Line Items */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Detalle de Ítems
                    </h4>
                    <InvoiceTable items={invoice.lineItems} onUpdate={onUpdateLineItems} />
                </div>

                <div className="h-px bg-white/10"></div>

                {/* Totals & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Concepto / Notas</label>
                        <textarea
                            rows={4}
                            value={invoice.generalConcept}
                            onChange={(e) => onUpdateField('generalConcept', e.target.value)}
                            className="w-full p-3 glass-input rounded-xl focus:bg-white/10 text-sm resize-none"
                            placeholder="Descripción general..."
                        />
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-sm text-slate-400">
                            <span>Subtotal Neto</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600">$</span>
                                <input
                                    type="number"
                                    value={invoice.netAmount}
                                    onChange={(e) => onUpdateField('netAmount', parseFloat(e.target.value))}
                                    className="w-24 bg-transparent text-right border-none p-0 focus:ring-0 text-slate-300 font-medium"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-400">
                            <span>Impuestos (IVA)</span>
                            <div className="flex items-center gap-1">
                                <span className="text-xs text-slate-600">$</span>
                                <input
                                    type="number"
                                    value={invoice.taxAmount}
                                    onChange={(e) => onUpdateField('taxAmount', parseFloat(e.target.value))}
                                    className="w-24 bg-transparent text-right border-none p-0 focus:ring-0 text-slate-300 font-medium"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-white/10 my-2"></div>

                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Total</span>
                            <div className="flex items-center gap-1 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/30">
                                <span className="text-emerald-400 font-bold">$</span>
                                <input
                                    type="number"
                                    value={invoice.totalAmount}
                                    onChange={(e) => onUpdateField('totalAmount', parseFloat(e.target.value))}
                                    className="w-32 bg-transparent text-right border-none p-0 focus:ring-0 text-xl font-bold text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
