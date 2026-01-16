const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

// Allow CORS for frontend clients (adjust origin as needed)
app.use(cors());
app.use(express.json());
app.use('/api', routes);

module.exports = app;

