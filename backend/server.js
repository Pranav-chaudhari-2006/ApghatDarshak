require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bodyParser = require('body-parser');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow:
//  • any localhost port (local development)
//  • every *.vercel.app subdomain (Vercel preview AND production deployments)
//  • an optional custom domain via the FRONTEND_URL env variable on Render
const VERCEL_PATTERN = /^https:\/\/[\w-]+\.vercel\.app$/;
const LOCALHOST_PATTERN = /^http:\/\/localhost(:\d+)?$/;
const extraOrigin = process.env.FRONTEND_URL; // set this in Render env vars if you have a custom domain

app.use(cors({
    origin: function (origin, callback) {
        // No origin = same-origin, Postman, mobile apps — allow
        if (!origin) return callback(null, true);
        // Explicit custom domain
        if (extraOrigin && origin === extraOrigin) return callback(null, true);
        // Localhost dev
        if (LOCALHOST_PATTERN.test(origin)) return callback(null, true);
        // Any Vercel preview or production URL
        if (VERCEL_PATTERN.test(origin)) return callback(null, true);

        console.warn(`⛔  CORS blocked origin: ${origin}`);
        return callback(new Error('CORS Policy: Unauthorised origin'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Pre-flight for all routes (must come BEFORE other middleware)
app.options('*', cors());

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
const routeRoutes = require('./routes/routeRoutes');
app.use('/api', routeRoutes);

app.get('/', (_req, res) => res.send('ApghatDarshak API is running ✅'));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   SUPABASE_URL:      ${process.env.SUPABASE_URL      ? '✅ Set' : '❌ MISSING'}`);
    console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING'}`);
    console.log(`   FRONTEND_URL:      ${process.env.FRONTEND_URL      ? process.env.FRONTEND_URL : '(not set — all vercel.app accepted)'}`);
});
