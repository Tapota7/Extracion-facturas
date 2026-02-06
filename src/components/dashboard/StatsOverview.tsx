import React, { useMemo } from 'react';
import { InvoiceData } from '../../types';
import { DollarSign, FileText, Calendar } from 'lucide-react';

interface StatsOverviewProps {
    history: InvoiceData[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ history }) => {
    const stats = useMemo(() => {
        const totalAmount = history.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
        const totalInvoices = history.length;
        // Simple logic for "this month" - assuming 'date' string parsing works or just showing total for now

        return {
            totalAmount,
            totalInvoices,
        };
    }, [history]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Facturas Escaneadas</p>
                    <h3 className="text-3xl font-bold text-white mt-1 group-hover:text-glow transition-all">{stats.totalInvoices}</h3>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <DollarSign className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Monto Total Procesado</p>
                    <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-lg text-emerald-400 font-bold">$</span>
                        <h3 className="text-3xl font-bold text-white group-hover:text-glow transition-all">
                            {stats.totalAmount.toLocaleString('es-AR')}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group bg-gradient-to-br from-indigo-900/50 to-purple-900/50">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="w-24 h-24 text-white" />
                </div>
                <div className="relative z-10">
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Estado del Sistema</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-white font-semibold">Gemini AI Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
