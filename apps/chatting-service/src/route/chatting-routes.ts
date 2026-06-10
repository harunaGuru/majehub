import express, { Router } from 'express';
import {
  createConversationGroupId,
  getAllUserConversationGroups,
  getConversationMessages,
  getSellerConversationMessages,
  getAllSellerConversationGroups,
} from '../controller/chatting-controller';
import { isAuthenticated } from '../../../../packages/middleware/isAuthenticated';
import { isSeller } from '../../../../packages/middleware/authorizeRole';

const router: Router = express.Router();

router.post(
  '/create-conversation-id',
  isAuthenticated('user'),
  createConversationGroupId
);
router.get(
  '/conversations',
  isAuthenticated('user'),
  getAllUserConversationGroups
);

router.get(
  '/conversations/:conversationId/messages',
  isAuthenticated('user'),
  getConversationMessages
);

router.get(
  '/seller/conversations',
  isAuthenticated('seller'),
  isSeller,
  getAllSellerConversationGroups
);
router.get(
  '/seller/conversations/:conversationId/messages',
  isAuthenticated('seller'),
  isSeller,
  getSellerConversationMessages
);
export default router;
