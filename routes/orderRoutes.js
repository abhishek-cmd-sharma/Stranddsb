const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, updateOrderToDelivered, cancelMyOrder, downloadInvoice, verifyPayment } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.route('/my').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrder);
router.route('/:id/invoice').get(protect, downloadInvoice);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelMyOrder);
router.route('/:id/pay').put(protect, verifyPayment);

module.exports = router;
