
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  vendorName: string;
  vendorTaxId: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  generalConcept: string;
  lineItems: InvoiceLineItem[];
  paymentTerms: string;
}

export type ExtractionStatus = 'idle' | 'loading' | 'success' | 'error';
