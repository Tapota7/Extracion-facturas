import { useState, useEffect } from 'react';
import { InvoiceData } from '../types';

const STORAGE_KEY = 'facturaai_history';

export const useInvoiceHistory = () => {
    const [history, setHistory] = useState<InvoiceData[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    const saveInvoice = (invoice: InvoiceData) => {
        setHistory(prev => {
            // Avoid duplicates based on invoice number if possible, currently simple append
            const newHistory = [invoice, ...prev];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const deleteInvoice = (index: number) => {
        setHistory(prev => {
            const newHistory = prev.filter((_, i) => i !== index);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
            return newHistory;
        });
    }

    return { history, saveInvoice, clearHistory, deleteInvoice };
};
