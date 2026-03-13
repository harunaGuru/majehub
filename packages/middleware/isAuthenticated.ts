import {  Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

interface AccessTokenPayload extends JwtPayload {
  userId?: string;
  sellerId?: string;
  email?: string;
  role: 'user' | 'seller';
}
export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const authHeader = req.header('Authorization');
  let token: string | undefined;
  if (req.cookies?.access_token) {
    token = req.cookies.access_token;
  } else if (req.cookies?.seller_access_token) {
    token = req.cookies.seller_access_token;
  } else if (authHeader?.toLowerCase().startsWith('bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    console.log("no token")
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

    if(!decoded){
      return res.status(401).json({
        success: false,
        message: 'Unauthorized!, invalid token',
      })
    }
    console.log("access_token", decoded);
    if(decoded.role === 'user') {
      const user = await prisma.users.findUnique({
        where: { id: decoded.userId },
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
      console.log("user from isAuthenticated", user);
      req.user = user;
    }else {
      const seller = await prisma.sellers.findUnique({
        where: { id: decoded.sellerId },
        include:{
          shop: true
        }
      })
      console.log("seller", seller);
      if (!seller) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        })
      }
      req.seller = seller;
    }

    return  next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Token',
    });
  }
};
