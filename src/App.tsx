import React, { useState, useCallback, useEffect } from 'react';
import { InvoiceData, ExtractionStatus, InvoiceLineItem } from './types';
import { extractInvoiceData } from './geminiService';
import { Header } from './components/layout/Header';
import { StatsOverview } from './components/dashboard/StatsOverview';
import { HistorySidebar } from './components/layout/HistorySidebar';
import { FileUpload } from './components/invoice/FileUpload';
import { InvoicePreview } from './components/invoice/InvoicePreview';
import { InvoiceForm } from './components/invoice/InvoiceForm';
import { useInvoiceHistory } from './hooks/useInvoiceHistory';

const App: React.FC = () => {
  const [status, setStatus] = useState<ExtractionStatus>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const { history, saveInvoice, deleteInvoice } = useInvoiceHistory();

  const handleFileSelect = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setStatus('idle');
    setInvoice(null);
    setError(null);
  }, []);

  const handleExtract = async () => {
    if (!imagePreview) return;

    setStatus('loading');
    setError(null);
    try {
      const data = await extractInvoiceData(imagePreview);
      setInvoice(data);
      setStatus('success');
      saveInvoice(data); // Auto-save to history
    } catch (err: any) {
      console.error(err);
      setError(`Error: ${err.message || 'No se pudo procesar la factura'}`);
      setStatus('error');
    }
  };

  const handleHistorySelect = (selectedInvoice: InvoiceData) => {
    setInvoice(selectedInvoice);
    setStatus('success');
    // Note: We don't have the image for history items in this simple implementation
    // unless we stored the base64 string (heavy). For now, we just show the data.
    setImagePreview(null);
  };

  const reset = () => {
    setStatus('idle');
    setInvoice(null);
    setImagePreview(null);
    setError(null);
  };

  // Field Updates
  const updateField = (field: keyof InvoiceData, value: string | number) => {
    if (invoice) {
      setInvoice({ ...invoice, [field]: value });
    }
  };

  const updateLineItems = (items: InvoiceLineItem[]) => {
    if (invoice) {
      setInvoice({ ...invoice, lineItems: items });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-indigo-500/30 font-sans pb-20">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
      </div>

      <Header onShowHistory={() => setShowHistory(true)} />

      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onSelect={handleHistorySelect}
        onDelete={deleteInvoice}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">

        {/* Intro / Stats */}
        {!invoice && !imagePreview && (
          <div className="animate-in fade-in duration-700 space-y-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-200 tracking-tight">
                Contabilidad Inteligente
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
                Extrae datos de facturas en segundos con la potencia de Gemini AI.
                <br />Automatiza tu flujo de trabajo hoy.
              </p>
            </div>

            <StatsOverview history={history} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Main Upload / Preview Area */}
          <div className={`transition-all duration-500 ${invoice ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
            {!imagePreview && !invoice ? (
              <FileUpload onFileSelect={handleFileSelect} isLoading={status === 'loading'} />
            ) : (
              <InvoicePreview
                imagePreview={imagePreview}
                status={status}
                onExtract={handleExtract}
                error={error}
              />
            )}

            {/* New Scan Button if showing preview/result */}
            {(imagePreview || invoice) && (
              <button
                onClick={reset}
                className="mt-6 w-full py-3 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Subir Otra Factura
              </button>
            )}
          </div>

          {/* Results Form */}
          {invoice && (
            <div className="lg:col-span-7">
              <InvoiceForm
                invoice={invoice}
                onUpdateField={updateField}
                onUpdateLineItems={updateLineItems}
                onReset={reset}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
