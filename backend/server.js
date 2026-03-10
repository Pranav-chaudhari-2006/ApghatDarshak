require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Routes
const routeRoutes = require('./routes/routeRoutes');
app.use('/api', routeRoutes);

app.get('/', (req, res) => {
  res.send('GuardianRoute API is running');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
