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
  logoutUser,
  logoutSeller,
  sellerRefreshToken,
  googleLogin,
} from '../controller/auth-controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRole';

const router: Router = express.Router();

router.post('/user-registration', registerUser);
router.post('/user-verification', verifyUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-forgot-password-otp', verifyUserForgotPasswordOtp);
router.post('/reset-password', isAuthenticated('user'), resetPassword);
router.post('/user-login', loginUser);
router.post('/google-login', googleLogin);
router.post('/refresh-token-user', refreshToken);
router.post('/refresh-token-seller', sellerRefreshToken);
router.post('/loginUser', loginUser);
router.post('/logout-user', isAuthenticated('user'), logoutUser);
router.get('/logged-in-user', isAuthenticated('user'), getUser);
router.post('/seller-registration', registerSeller);
router.post('/seller-verification', verifySeller);
router.post('/forgot-seller-password', forgotSellerPassword);
router.post(
  '/verify-forgot-seller-password-otp',
  verifySellerForgotPasswordOtp
);
router.post(
  '/reset-seller-password',
  isAuthenticated('seller'),
  resetSellerPassword
);
router.post('/seller-login', loginSeller);
router.post(
  '/logout-seller',
  isAuthenticated('seller'),
  isSeller,
  logoutSeller
);
router.post('/create-shop', isAuthenticated('seller'), createShop);
router.get('/logged-in-seller', isAuthenticated('seller'), getSeller);
router.post(
  '/create-stripe-link',
  isAuthenticated('seller'),
  createConnectedAccount
);
router.post('/testing-endpoint', testingEndpoint);

export default router;
