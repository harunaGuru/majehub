import { Router } from 'express';
import {
  getAllShops,
  getShopById,
  followShop,
  unFollowShop,
  getShopProducts,
  getShopEvents,
  getShopReviews,
  isFollowing,
  getSellerProfile,
  editSellerProfile,
  updateShopAvatar,
  updateShopBanner,
  getSellerEvents,
  getSellerProducts,
  getSellerReviews,
  deleteShop,
  restoreShop,
  getSellerNotifications,
  markNotificationAsRead,
} from '../controller/seller-controller';
import {
  isAuthenticated,
  isAuthenticatedMeta,
} from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRole';

const router: Router = Router();

router.get('/get-shop-by-id/:shopId', getShopById);
router.get('/get-shop-products/:shopId', getShopProducts);
router.get('/get-shop-events/:shopId', getShopEvents);
router.get('/get-shop-reviews/:shopId', getShopReviews);
router.get('/get-all-shops', getAllShops);
router.post('/follow-shop', isAuthenticated('user'), followShop);
router.post('/unfollow-shop', isAuthenticated('user'), unFollowShop);
router.get('/is-following/:shopId', isAuthenticated('user'), isFollowing);
router.get(
  '/get-seller-profile',
  isAuthenticated('seller'),
  isSeller,
  getSellerProfile
);
router.put(
  '/edit-seller-profile',
  isAuthenticated('seller'),
  isSeller,
  editSellerProfile
);
router.patch(
  '/update-shop-avatar',
  isAuthenticated('seller'),
  isSeller,
  updateShopAvatar
);
router.patch(
  '/update-shop-banner',
  isAuthenticated('seller'),
  isSeller,
  updateShopBanner
);
router.get(
  '/get-seller-events',
  isAuthenticated('seller'),
  isSeller,
  getSellerEvents
);
router.get(
  '/get-seller-products',
  isAuthenticated('seller'),
  isSeller,
  getSellerProducts
);
router.get(
  '/get-seller-reviews',
  isAuthenticated('seller'),
  isSeller,
  getSellerReviews
);
router.put('/delete-shop', isAuthenticated('seller'), isSeller, deleteShop);
router.put('/restore-shop', isAuthenticated('seller'), isSeller, restoreShop);
router.get(
  '/get-seller-notifications',
  isAuthenticated('seller'),
  isSeller,
  getSellerNotifications
);
router.post(
  '/mark-notification-as-read',
  isAuthenticatedMeta,
  markNotificationAsRead
);

export default router;
