import express, { Router } from 'express';
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  refreshToken,
  testingEndpoint,
  verifyUser,
  verifyUserForgotPasswordOtp,
  registerSeller,
  getUser,
  getSeller,
  verifySeller,
  forgotSellerPassword,
  verifySellerForgotPasswordOtp,
  resetSellerPassword,
  loginSeller,
  createShop,
  createConnectedAccount,
} from '../controller/auth-controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';

const router: Router = express.Router();

router.post('/user-registration', registerUser);
router.post('/user-verification', verifyUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyUserForgotPasswordOtp);
router.post('/reset-password', resetPassword);
router.post('/user-login', loginUser);
router.post('/refresh-token-user', refreshToken);
router.post('/loginUser', loginUser)
router.get('/logged-in-user', isAuthenticated, getUser)
router.post('/seller-registration', registerSeller)
router.post('/seller-verification', verifySeller)
router.post('/forgot-seller-password', forgotSellerPassword)
router.post('/verify-forgot-seller-password-otp', verifySellerForgotPasswordOtp)
router.post('/reset-seller-password', resetSellerPassword)
router.post("/seller-login", loginSeller )
router.post('/create-shop', createShop)
router.get('/logged-in-seller', isAuthenticated, getSeller )
router.post("/create-stripe-link", createConnectedAccount)
router.post('/testing-endpoint', testingEndpoint);

export default router;
