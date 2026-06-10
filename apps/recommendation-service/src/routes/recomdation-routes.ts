import { Router } from 'express';
import { getRecommendedProducts } from '../controllers/recommendation.controllers';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
const router: Router = Router();

router.get(
  '/recommended-products',
  isAuthenticated('user'),
  getRecommendedProducts
);

export default router;
