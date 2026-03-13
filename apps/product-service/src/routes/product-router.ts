import {Router} from 'express'
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
} from '../controller/product-controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRole';

const router:Router = Router();
router.post('/upload-image', isAuthenticated, isSeller, uploadImage);
router.delete('/delete-image/:fileId', isAuthenticated, isSeller, deleteImage);
router.get('/categories', getCategory);
router.post('/create-discount', isAuthenticated, isSeller, createDiscount);
router.delete('/delete-discount/:id', isAuthenticated, isSeller, deleteDiscount);
router.get('/discounts', isAuthenticated, isSeller, getShopDiscounts)
router.post('/create-product', isAuthenticated, isSeller, createProduct);
router.get('/get-all-products', isAuthenticated, getAllShopProducts);
router.get('/get-all-events', isAuthenticated, getAllShopEvents);
router.patch('/soft-delete-product/:id', isAuthenticated, isSeller, softDelete);
router.patch('/restore-product/:id', isAuthenticated, isSeller, restoreProduct);
router.get('/get-latest-top-products', getLatestAndTopProducts);
router.get('/get-product/:slug', getProduct);
router.get('/get-products', isAuthenticated, getAllProducts);
router.get('/get-events', isAuthenticated, getAllOffers);

export default router;