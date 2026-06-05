const express = require('express');
const router = express.Router();

const {
    getMenuWithSales,
    getTopItems,
    getSalesStats,
    getOrdersWithEmployees
} = require('../controllers/reportController');

router.get('/menu-with-sales', getMenuWithSales);
router.get('/top-items', getTopItems);
router.get('/sales-stats', getSalesStats);
router.get('/orders-with-employees', getOrdersWithEmployees);

module.exports = router;