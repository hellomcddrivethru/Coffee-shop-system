const express = require('express');
const router = express.Router();

const { handleLogin, register } = require('../controllers/authController');

// LOGIN ROUTES
router.post('/login/cashier', handleLogin('cashier'));
router.post('/login/manager', handleLogin('manager'));

// REGISTER
router.post('/register', register);

module.exports = router;