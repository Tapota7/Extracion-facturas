import { GoogleGenerativeAI } from "@google/generative-ai";
import { InvoiceData } from "./types";

export const extractInvoiceData = async (base64Image: string): Promise<InvoiceData> => {
  // Soporta tanto Vite (import.meta.env) como Node.js (process.env)
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key no configurada. Verifica .env.local o variables de entorno");
  }

  // Clean base64 if it has data URL prefix
  const base64Clean = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Analyze this invoice image and extract the following information in JSON format:
- invoiceNumber: invoice number
- date: date
- vendorName: vendor name
- vendorTaxId: tax ID (RUT/CUIT)
- totalAmount: total amount (number only)
- taxAmount: tax amount (number only, use 0 if not visible)
- netAmount: net amount (number only, calculate as totalAmount - taxAmount if not shown)
- generalConcept: general concept/description
- paymentTerms: payment terms
- lineItems: array of objects with {description, quantity, unitPrice, subtotal}

Return ONLY valid JSON, no markdown, no extra text.`;

    const imagePart = {
      inlineData: {
        data: base64Clean,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error("No se recibió respuesta válida de la API");
    }

    // Clean markdown code blocks
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleanedText) as InvoiceData;

    // Ensure numeric fields
    parsed.totalAmount = Number(parsed.totalAmount) || 0;
    parsed.taxAmount = Number(parsed.taxAmount) || 0;
    parsed.netAmount = Number(parsed.netAmount) || 0;

    if (parsed.lineItems) {
      parsed.lineItems = parsed.lineItems.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
        subtotal: Number(item.subtotal) || 0
      }));
    }

    return parsed;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Error al procesar la factura");
  }
};
