'use strict';

const { Router } = require('express');

const authRoutes = require('./authRoutes');
const examRoutes = require('./examRoutes');
const questionRoutes = require('./questionRoutes');
const submissionRoutes = require('./submissionRoutes');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/exams', examRoutes);
router.use('/questions', questionRoutes);
router.use('/submissions', submissionRoutes);

module.exports = router;
