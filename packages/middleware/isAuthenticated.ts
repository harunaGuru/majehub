import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AccessTokenPayload extends JwtPayload {
  userId?: string;
  sellerId?: string;
  email?: string;
  role: 'user' | 'seller' | 'admin';
}

export const isAuthenticated =
  (role: 'user' | 'seller' | 'admin') =>
  async (
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    let token;

    switch (role) {
      case 'user':
        token = req.cookies?.access_token;
        break;

      case 'seller':
        token = req.cookies?.seller_access_token;
        break;

      case 'admin':
        token = req.cookies?.admin_access_token;
        break;
    }

    if (!token) {
      console.log('no token');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as AccessTokenPayload;

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized!, invalid token',
        });
      }
      console.log('access_token', decoded);
      if (decoded.role === 'user') {
        const user = await prisma.users.findUnique({
          where: { id: decoded.userId },
          include: {
            avatar: true,
          },
        });
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }
        console.log('user from isAuthenticated', user);
        req.user = user;
      } else if (decoded.role === 'seller') {
        const seller = await prisma.sellers.findUnique({
          where: { id: decoded.sellerId },
          include: {
            shop: true,
          },
        });
        console.log('seller', seller);
        if (!seller) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }
        req.seller = seller;
      } else if (decoded.role === 'admin') {
        const admin = await prisma.users.findUnique({
          where: { id: decoded.userId, role: 'Admin' },
        });
        if (!admin) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized',
          });
        }
        console.log('admin from isAuthenticated', admin);
        req.admin = admin;
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Token',
      });
    }
  };

export interface AuthUser {
  id: string;
  role: 'user' | 'seller' | 'admin';
  email: string;
}

export const isAuthenticatedMeta = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header('Authorization');

  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    token =
      req.cookies?.access_token ??
      req.cookies?.seller_access_token ??
      req.cookies?.admin_access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const decoded = jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET!
  ) as AccessTokenPayload;

  req.auth = {
    id: decoded.userId || decoded.sellerId,
    role: decoded.role,
    email: decoded.email,
  };

  return next();
};
