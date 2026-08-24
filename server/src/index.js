require('dotenv').config();
const express = require('express');
const cors = require('cors');
const tripRoutes = require('./routes/trip');

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : undefined));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'BiharrChle API' });
});

app.use('/api', tripRoutes);

app.listen(process.env.PORT || 3000, () => console.log('BiharrChle server running on port ' + (process.env.PORT || 3000)));
