
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractInvoiceData } from '../src/geminiService.js';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' })); // Aumentar límite para imágenes base64

// Endpoint para extraer datos de facturas
app.post('/api/extract-invoice', async (req, res) => {
    const { image } = req.body;

    if (!image) {
        return res.status(400).json({ error: 'Se requiere una imagen en formato base64' });
    }

    try {
        const data = await extractInvoiceData(image);
        res.json(data);
    } catch (error: any) {
        console.error('Error en el servidor API:', error);
        res.status(500).json({ error: error.message || 'Error interno al procesar la factura' });
    }
});

// Ruta simple de prueba
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'FacturaAI API' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor API REST levantado en http://localhost:${PORT}`);
    console.log(`📡 Endpoint disponible en: POST http://localhost:${PORT}/api/extract-invoice`);
});
