import express, { Router } from 'express';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
import { isAdmin } from '../../../../packages/middleware/authorizeRole';
import {
  addNewAdmin,
  getLoggedInAdmin,
  loginAdmin,
  getAllOrders,
  getAllProducts,
  getAllEvents,
  getAllUsers,
  getAllSellers,
  banUser,
  restoreUser,
  addCategory,
  addSubCategory,
  getConfig,
  uploadSiteAsset,
  logoutAdmin,
  getAdminNotifications,
} from '../controller/admin-controller';

const router: Router = express.Router();

router.post('/add-new-admin', isAuthenticated('admin'), isAdmin, addNewAdmin);
router.post('/login-admin', loginAdmin);
router.get(
  '/get-logged-in-admin',
  isAuthenticated('admin'),
  isAdmin,
  getLoggedInAdmin
);
router.get('/get-all-orders', isAuthenticated('admin'), isAdmin, getAllOrders);
router.get(
  '/get-all-products',
  isAuthenticated('admin'),
  isAdmin,
  getAllProducts
);
router.get('/get-all-events', isAuthenticated('admin'), isAdmin, getAllEvents);
router.get('/get-all-users', isAuthenticated('admin'), isAdmin, getAllUsers);
router.get(
  '/get-all-sellers',
  isAuthenticated('admin'),
  isAdmin,
  getAllSellers
);
router.put('/ban-user', isAuthenticated('admin'), isAdmin, banUser);
router.put('/restore-user', isAuthenticated('admin'), isAdmin, restoreUser);
router.post('/add-category', isAuthenticated('admin'), isAdmin, addCategory);
router.post(
  '/add-subcategory',
  isAuthenticated('admin'),
  isAdmin,
  addSubCategory
);
router.get('/site-config', getConfig);
router.post(
  '/upload-asset',
  isAuthenticated('admin'),
  isAdmin,
  uploadSiteAsset
);
router.post('/logout-admin', isAuthenticated('admin'), isAdmin, logoutAdmin);
router.get(
  '/get-admin-notifications',
  isAuthenticated('admin'),
  isAdmin,
  getAdminNotifications
);
export default router;
