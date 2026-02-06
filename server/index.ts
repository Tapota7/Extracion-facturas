
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { extractInvoiceData } from '../src/geminiService.js';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Almacén en memoria para suscripciones y eventos (en producción usar base de datos)
const webhookSubscriptions: string[] = [];
const webhookEvents: any[] = [];

// Almacén en memoria para trabajos (Simulando una cola asíncrona)
const invoiceJobs = new Map<string, {
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    result?: any,
    error?: string,
    createdAt: string
}>();

// Middleware de Autenticación JWT
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado.' });
        }
        (req as any).user = user;
        next();
    });
};

// Función para notificar a los suscriptores
const notifyWebhooks = async (event: string, data: any) => {
    const payload = {
        event,
        timestamp: new Date().toISOString(),
        data
    };

    webhookEvents.unshift(payload);
    if (webhookEvents.length > 50) webhookEvents.pop();

    console.log(`📢 Emitiendo evento Webhook: ${event}`);

    webhookSubscriptions.forEach(async (url) => {
        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log(`✅ Notificado exitosamente: ${url}`);
        } catch (error) {
            console.error(`❌ Error notificando a ${url}:`, error);
        }
    });
};

// Endpoint de Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.API_USER && password === process.env.API_PASSWORD) {
        const user = { name: username };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '8h' });
        return res.json({ accessToken });
    }
    res.status(401).json({ error: 'Credenciales inválidas' });
});

// --- SISTEMA DE WEBHOOKS ---
app.post('/api/webhooks', (req, res) => {
    console.log('📌 Webhook Recibido en /api/webhooks:', req.body);
    res.status(200).json({ status: 'received' });
});

app.post('/api/webhooks/subscribe', authenticateToken, (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'Se requiere una URL' });
    if (!webhookSubscriptions.includes(url)) {
        webhookSubscriptions.push(url);
    }
    res.json({ message: 'Suscripción exitosa', activeSubscriptions: webhookSubscriptions });
});

app.get('/api/webhooks/events', authenticateToken, (req, res) => {
    res.json(webhookEvents);
});

// --- SISTEMA DE COLAS (QUEUE) ---

// 1. Encola una factura para procesamiento asíncrono
app.post('/api/queue-invoice', authenticateToken, async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Se requiere imagen en base64' });

    const jobId = Buffer.from(Date.now().toString()).toString('base64').slice(-8);

    // Registrar el trabajo
    invoiceJobs.set(jobId, {
        id: jobId,
        status: 'pending',
        createdAt: new Date().toISOString()
    });

    // Iniciar procesamiento en segundo plano (sin await)
    processInvoiceBackground(jobId, image);

    res.json({
        message: 'Factura encolada con éxito',
        jobId,
        statusUrl: `/api/job-status/${jobId}`
    });
});

// 2. Consulta el estado de un trabajo
app.get('/api/job-status/:id', authenticateToken, (req, res) => {
    const jobId = req.params.id as string;
    const job = invoiceJobs.get(jobId);
    if (!job) return res.status(404).json({ error: 'Trabajo no encontrado' });
    res.json(job);
});

// Función interna para procesamiento en segundo plano
async function processInvoiceBackground(jobId: string, image: string) {
    const job = invoiceJobs.get(jobId);
    if (!job) return;

    job.status = 'processing';
    console.log(`⏳ Procesando Trabajo [${jobId}] en segundo plano...`);

    try {
        const data = await extractInvoiceData(image);
        job.status = 'completed';
        job.result = data;

        // Notificar éxito via Webhook
        notifyWebhooks('invoice.extraction.completed', { jobId, status: 'success', data });

    } catch (error: any) {
        job.status = 'failed';
        job.error = error.message;

        // Notificar fallo via Webhook
        notifyWebhooks('invoice.extraction.completed', { jobId, status: 'failed', error: error.message });
    }
}

// Endpoint Síncrono Tradicional (Mantenido por compatibilidad)
app.post('/api/extract-invoice', authenticateToken, async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Se requiere imagen' });

    try {
        const data = await extractInvoiceData(image);
        notifyWebhooks('invoice.extraction.success', { vendor: data.vendorName, amount: data.totalAmount });
        res.json(data);
    } catch (error: any) {
        notifyWebhooks('invoice.extraction.failure', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});
// Ruta simple de prueba (Pública)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'FacturaAI API with Webhooks' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor API con Webhooks levantado en http://localhost:${PORT}`);
    console.log(`🔑 Login en: POST http://localhost:${PORT}/api/login`);
    console.log(`🔗 Suscribirse en: POST http://localhost:${PORT}/api/webhooks/subscribe`);
    console.log(`📜 Historial en: GET http://localhost:${PORT}/api/webhooks/events`);
    console.log(`🔒 Endpoint activo: POST http://localhost:${PORT}/api/extract-invoice`);
});
