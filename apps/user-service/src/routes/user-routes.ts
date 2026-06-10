import { Router } from 'express';
import {
  uploadUserImage,
  getUserAddress,
  addUserAddress,
  deleteUserAddress,
  getUserNotifications,
} from '../controller/user-controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
import { isUser } from '../../../../packages/middleware/authorizeRole';

const router: Router = Router();

router.post('/upload-avatar', isAuthenticated('user'), isUser, uploadUserImage);
router.get(
  '/get-user-address',
  isAuthenticated('user'),
  isUser,
  getUserAddress
);
router.get(
  '/get-user-notifications',
  isAuthenticated('user'),
  isUser,
  getUserNotifications
);
router.post(
  '/add-user-address',
  isAuthenticated('user'),
  isUser,
  addUserAddress
);
router.delete(
  '/delete-user-address/:addressId',
  isAuthenticated('user'),
  isUser,
  deleteUserAddress
);
export default router;
