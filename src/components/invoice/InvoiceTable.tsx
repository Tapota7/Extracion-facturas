import React from 'react';
import { InvoiceLineItem } from '../../types';

interface InvoiceTableProps {
  items: InvoiceLineItem[];
  onUpdate: (items: InvoiceLineItem[]) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ items, onUpdate }) => {
  const handleChange = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Auto-calculate subtotal if qty or price changes
    if (field === 'quantity' || field === 'unitPrice') {
      item.subtotal = Number(item.quantity) * Number(item.unitPrice);
    }

    newItems[index] = item;
    onUpdate(newItems);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-slate-900/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Concepto</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Cant.</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">P. Unitario</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {items.map((item, idx) => (
            <tr key={idx} className="hover:bg-white/5 transition-colors">
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleChange(idx, 'description', e.target.value)}
                  className="w-full bg-transparent border-none text-slate-200 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm transition-all"
                  placeholder="Descripción"
                />
              </td>
              <td className="px-4 py-2 text-right">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleChange(idx, 'quantity', parseFloat(e.target.value))}
                  className="w-20 bg-transparent border-none text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-right transition-all"
                />
              </td>
              <td className="px-4 py-2 text-right">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleChange(idx, 'unitPrice', parseFloat(e.target.value))}
                  className="w-28 bg-transparent border-none text-slate-200 focus:ring-1 focus:ring-indigo-500 rounded px-2 py-1 text-sm text-right transition-all"
                />
              </td>
              <td className="px-4 py-2 text-right text-sm font-medium text-indigo-300">
                ${item.subtotal.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
