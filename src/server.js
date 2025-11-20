import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import checkinRouter from './routes/checkin.js';

const app = express();

// Security headers
app.use(helmet());

// CORS (sviluppo: consenti file:// e origini locali comuni)
const corsOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
const localWhitelist = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'file://',
  'null'
]);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // permetti richieste senza origin (es. file://)
    if (corsOrigins.length === 0 || corsOrigins.includes(origin) || localWhitelist.has(origin)) return cb(null, true);
    return cb(new Error('CORS not allowed for origin: ' + origin));
  }
}));

// Rate limit (basic)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/checkin', checkinRouter);

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
