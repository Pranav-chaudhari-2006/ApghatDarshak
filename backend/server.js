require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
