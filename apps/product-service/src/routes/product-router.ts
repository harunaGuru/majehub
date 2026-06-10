import { Router } from 'express';
import {
  createDiscount,
  createProduct,
  deleteDiscount,
  deleteImage,
  getAllProducts,
  getAllShopEvents,
  getAllShopProducts,
  getCategory,
  getProduct,
  getShopDiscounts,
  restoreProduct,
  softDelete,
  uploadImage,
  getLatestAndTopProducts,
  getAllOffers,
  searchProducts,
  editProduct,
  getTopShops,
  getLatestOffers,
} from '../controller/product-controller';
import {
  isAuthenticated,
  isAuthenticatedMeta,
} from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRole';

const router: Router = Router();
router.post('/upload-image', isAuthenticatedMeta, uploadImage);
router.delete(
  '/delete-image/:fileId',
  isAuthenticated('seller'),
  isSeller,
  deleteImage
);
router.get('/categories', getCategory);
router.post('/create-discount', isAuthenticated('seller'), createDiscount);
router.delete(
  '/delete-discount/:id',
  isAuthenticated('seller'),
  isSeller,
  deleteDiscount
);
router.get('/discounts', isAuthenticated('seller'), isSeller, getShopDiscounts);
router.post(
  '/create-product',
  isAuthenticated('seller'),
  isSeller,
  createProduct
);
router.put(
  '/edit-product/:productId',
  isAuthenticated('seller'),
  isSeller,
  editProduct
);
router.get(
  '/get-all-products',
  isAuthenticated('seller'),
  isSeller,
  getAllShopProducts
);
router.get(
  '/get-all-events',
  isAuthenticated('seller'),
  isSeller,
  getAllShopEvents
);
router.patch(
  '/soft-delete-product/:id',
  isAuthenticated('seller'),
  isSeller,
  softDelete
);
router.patch(
  '/restore-product/:id',
  isAuthenticated('seller'),
  isSeller,
  restoreProduct
);
router.get('/get-latest-top-products', getLatestAndTopProducts);
router.get('/get-latest-offers', getLatestOffers);
router.get('/get-product/:slug', getProduct);
router.get('/get-products', getAllProducts);
router.get('/get-events', getAllOffers);
router.get('/top-shops', getTopShops);
router.get('/search-products', searchProducts);

export default router;
