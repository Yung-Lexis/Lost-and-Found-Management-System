const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/register - Register new account
router.post('/register', register);

// POST /api/auth/login - User login
router.post('/login', login);

// GET /api/auth/me - Current user details
router.get('/me', requireAuth, getMe);

module.exports = router;
