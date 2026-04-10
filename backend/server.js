require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Ensure the backend only blindly trusts your exact Vercel frontend and local development server
const allowedOrigins = [
    'http://localhost:5173', 
    'https://apghatdarshak.vercel.app', 
    process.env.FRONTEND_URL // Fallback if you add custom domains later via Render Env Vars
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests) if needed, 
        // in production you might want to switch `!origin` to block them.
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS Policy Block: Unauthorized Access'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
const routeRoutes = require('./routes/routeRoutes');
app.use('/api', routeRoutes);

app.get('/', (req, res) => {
    res.send('ApghatDarshak API is running ✅');
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ MISSING'}`);
    console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING'}`);
});
