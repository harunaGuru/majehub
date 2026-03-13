import 'express';
import { Seller, User } from './types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      seller?: Seller;
    }
  }
}

export {}; // 👈 IMPORTANT: makes this a module
