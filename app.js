require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { securityHeaders, corsConfig } = require('./middleware/securityHeaders');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const examRoutes = require('./routes/examRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
app.set('trust proxy', 1);

app.use(securityHeaders);
app.use(corsConfig);
app.use(generalLimiter);
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({ auth: true, status: 'API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/submission', submissionRoutes);

app.use((req, res) => {
  res.status(404).json({ auth: false, error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
