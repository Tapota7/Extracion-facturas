import { InvoiceData } from "./types";

export const extractInvoiceData = async (base64Image: string): Promise<InvoiceData> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("API Key no configurada. Verifica .env.local");
  }

  // Clean base64 if it has data URL prefix
  const base64Clean = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  const requestBody = {
    contents: [{
      parts: [
        {
          text: `Analyze this invoice image and extract the following information in JSON format:
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

Return ONLY valid JSON, no markdown, no extra text.`
        },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Clean
          }
        }
      ]
    }]
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error("No se recibió respuesta válida de la API");
    }

    let text = data.candidates[0].content.parts[0].text;

    // Clean markdown code blocks
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(text) as InvoiceData;

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
