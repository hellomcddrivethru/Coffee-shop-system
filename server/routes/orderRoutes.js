const express = require('express');
const router = express.Router();

const {
    checkout,
    getOrders,
    getOrderById,
    deleteOrder,
    updatePayment
} = require('../controllers/orderController');

router.post('/checkout', checkout);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.delete('/orders/:id', deleteOrder);
router.put('/orders/:id/payment', updatePayment);

module.exports = router;