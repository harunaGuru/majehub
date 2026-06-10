import express, { Router } from 'express';
import {
  createPaymentSession,
  paymentIntent,
  verifyPaymentSession,
  applyCoupon,
  getUserOrders,
  getOrderById,
  getSellerOrders,
  getOrderDetails,
  updateOrderDeliveryStatus,
} from '../controller/order-controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRole';

const router: Router = express.Router();

router.post(
  '/create-payment-session',
  isAuthenticated('user'),
  createPaymentSession
);
router.post('/payment-intent', isAuthenticated('user'), paymentIntent);
router.get(
  '/verify-payment-session',
  isAuthenticated('user'),
  verifyPaymentSession
);
router.post('/apply-coupon', isAuthenticated('user'), applyCoupon);
router.get('/user-orders', isAuthenticated('user'), getUserOrders);
router.get('/order/:orderId', getOrderById);
router.get(
  '/seller-orders',
  isAuthenticated('seller'),
  isSeller,
  getSellerOrders
);
router.get(
  '/seller/order/:orderId',
  isAuthenticated('seller'),
  isSeller,
  getOrderDetails
);
router.put(
  '/seller/order/:orderId/delivery-status',
  isAuthenticated('seller'),
  isSeller,
  updateOrderDeliveryStatus
);

export default router;
