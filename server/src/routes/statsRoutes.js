const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/statsController');

// GET /api/stats/summary - Dashboard counts and metrics
router.get('/summary', getDashboardSummary);

module.exports = router;
