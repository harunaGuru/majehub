import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../../packages/lib/prisma';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { imagekit } from '../../../../packages/lib/imagekit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
} from '../utils/cookies';

type RefreshTokenPayload = {
  role: 'admin';
  email: string;
  userId: string;
};

export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({
      where: { email, role: 'Admin' },
    });
    if (!user) {
      //   sendLog({
      //     type: 'error',
      //     message: 'No user found',
      //     source: 'admin-service',
      //     metadata: { email },
      //   })
      return next(new AuthError('Invalid Credentials'));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('invalid user');
      return next(new AuthError('Invalid Credentials'));
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: 'admin',
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: 'admin',
    });
    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken,
    });
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
};

export const getLoggedInAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const admin = req.admin;
  if (!admin) {
    return next(new AuthError('Unauthorized'));
  }
  res.status(200).json({
    success: true,
    admin,
  });
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.admin_refresh_token;

    if (!refreshToken) {
      return next(new AuthError('Unauthorized: no refresh token'));
    }

    let decoded: RefreshTokenPayload;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as RefreshTokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new AuthError('Refresh token has expired'));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new AuthError('Invalid refresh token'));
      }
      return next(error);
    }

    const account = await prisma.users.findUnique({
      where: { id: decoded.userId, role: 'Admin' },
    });

    if (!account || account.email !== decoded.email) {
      return next(new AuthError('Forbidden: Admin not found'));
    }

    const newAccessToken = signAccessToken({
      email: account.email,
      role: decoded.role,
      userId: account.id,
    });

    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addNewAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return res.status(200).json({ message: 'User does not exist' });
    }
    if (existingUser.role === 'Admin') {
      return res.status(200).json({ message: 'User is already an admin' });
    }

    await prisma.users.update({
      where: { email },
      data: { role: 'Admin' },
    });
    return res.status(200).json({ message: 'Admin added successfully' });
  } catch (error) {
    return next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await prisma.orders.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        total: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      customer: {
        id: order.user?.id,
        name: order.user?.name || 'Unknown Customer',
      },
      shop: {
        id: order.shop?.id,
        name: order.shop?.name || 'Unknown Shop',
      },
    }));

    return res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Get All Orders Error:', error);
    return next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page = '1', limit = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 100 // prevent abuse
    ) {
      return next(new ValidationError('Invalid pagination parameters'));
    }

    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await prisma.products.count();

    const products = await prisma.products.findMany({
      where: {
        OR: [{ starting_date: null }, { ending_date: null }],
      },
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        regular_price: true,
        stock: true,
        category: true,
        subCategory: true,
        ratings: true,
        createdAt: true,
        images: {
          take: 1,
          select: {
            fileUrl: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.title,
      price: product.regular_price,
      stock: product.stock,
      date: product.createdAt,
      slug: product.slug,
      image: product.images[0]?.fileUrl || null,
      category: product.category,
      subCategory: product.subCategory,
      ratings: product.ratings,
      shop: {
        id: product.shop?.id,
        name: product.shop?.name || 'Unknown Shop',
      },
    }));

    return res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total: totalProducts,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalProducts,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Get All Products Error:', error);
    return next(error);
  }
};

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page = '1', limit = '10' } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return next(new ValidationError('Invalid pagination parameters'));
    }

    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await prisma.products.count();

    const products = await prisma.products.findMany({
      where: {
        OR: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
      },
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        regular_price: true,
        starting_date: true,
        ending_date: true,
        stock: true,
        category: true,
        subCategory: true,
        ratings: true,
        createdAt: true,
        images: {
          take: 1,
          select: {
            fileUrl: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.title,
      price: product.regular_price,
      stock: product.stock,
      date: product.createdAt,
      slug: product.slug,
      image: product.images[0]?.fileUrl || null,
      category: product.category,
      subCategory: product.subCategory,
      start: product.starting_date,
      end: product.ending_date,
      ratings: product.ratings,
      shop: {
        id: product.shop?.id,
        name: product.shop?.name || 'Unknown Shop',
      },
    }));

    return res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total: totalProducts,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalProducts / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalProducts,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Get All Products Error:', error);
    return next(error);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page = '1', limit = '10', role } = req.query;
    console.log(role);

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;
    let where: any = {};
    if (role) {
      where.role = role;
    }
    const totalUsers = await prisma.users.count({
      where,
    });
    const users = await prisma.users.findMany({
      where,
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isDeleted: true,
        deletedAt: true,
      },
    });
    console.log(users);
    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalUsers,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    return next(error);
  }
};

export const getAllSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalSellers = await prisma.sellers.count();
    const sellers = await prisma.sellers.findMany({
      skip,
      take: limitNumber,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            avatar: true,
          },
        },
      },
    });
    const formattedSellers = sellers.map((seller) => ({
      id: seller.id,
      name: seller.name,
      email: seller.email,
      createdAt: seller.createdAt,
      shopId: seller.shop?.id,
      shopName: seller.shop?.name,
      address: seller.shop?.address,
      avatar: seller.shop?.avatar,
    }));
    return res.status(200).json({
      success: true,
      sellers: formattedSellers,
      pagination: {
        total: totalSellers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalSellers / limitNumber),
        hasNextPage: pageNumber * limitNumber < totalSellers,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error('Get All Sellers Error:', error);
    return next(error);
  }
};

export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    console.log('user id', userId);
    if (!userId) {
      return next(new ValidationError('User ID is required'));
    }
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return next(new ValidationError('User not found'));
    }
    if (user.isDeleted && user.deletedAt && user.deletedAt > new Date()) {
      return next(
        new ValidationError('User is already deleted, You can restore user')
      );
    }
    await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000), // deleted after 27 days
      },
    });
    return res.status(200).json({
      success: true,
      message: 'User banned successfully',
    });
  } catch (error) {
    console.error('Ban User Error:', error);
    return next(error);
  }
};

export const restoreUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return next(new ValidationError('User ID is required'));
    }
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return next(new ValidationError('User not found'));
    }
    if (!user.isDeleted) {
      return next(new ValidationError('User is already active'));
    }
    await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    return res.status(200).json({
      success: true,
      message: 'User restored successfully',
    });
  } catch (error) {
    console.error('Restore User Error:', error);
    return next(error);
  }
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      return next(new ValidationError('Category name is required'));
    }

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      return next(
        new ValidationError('Category name must be at least 2 characters')
      );
    }

    const config = await prisma.siteConfig.findFirst();

    if (!config) {
      return next(new ValidationError('Site config not initialized'));
    }

    if (config.categories.includes(trimmedName)) {
      return next(new ValidationError('Category already exists'));
    }

    const updated = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        categories: [...config.categories, trimmedName],
        subCategories: {
          ...(config.subCategories as object),
          [trimmedName]: [],
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Category added successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Add Category Error:', error);
    return next(error);
  }
};

export const addSubCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { category, subCategory } = req.body;

    if (!category || !subCategory) {
      return next(new ValidationError('Category and subCategory are required'));
    }

    const config = await prisma.siteConfig.findFirst();

    if (!config) {
      return next(new ValidationError('Site config not found'));
    }

    if (!config.categories.includes(category)) {
      return next(new ValidationError('Category does not exist'));
    }

    const subCategories = config.subCategories as Record<string, string[]>;

    const existingSubs = subCategories[category] || [];

    if (existingSubs.includes(subCategory)) {
      return next(new ValidationError('Subcategory already exists'));
    }

    const updatedSubCategories = {
      ...subCategories,
      [category]: [...existingSubs, subCategory],
    };

    const updated = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        subCategories: updatedSubCategories,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Subcategory added successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Add SubCategory Error:', error);
    return next(error);
  }
};

export const getConfig = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.siteConfig.findFirst();
    if (!config) {
      return next(new ValidationError('Site config not found'));
    }
    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Get Config Error:', error);
    return next(error);
  }
};

export const uploadSiteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, fileName, folder, type } = req.body;

    if (!file || !fileName || !type) {
      return next(
        new ValidationError('File and fileName and type are required')
      );
    }

    if (!['logo', 'banner'].includes(type)) {
      return next(new ValidationError('Invalid type (logo or banner only)'));
    }

    if (typeof file !== 'string' || !file.startsWith('data:')) {
      return next(new ValidationError('Invalid file format (base64 expected)'));
    }

    const config = await prisma.siteConfig.findFirst();

    if (!config) {
      return next(new ValidationError('Site config not found'));
    }

    const uploadResponse = await imagekit.upload({
      file,
      fileName,
      folder: folder || type,
    });

    const updated = await prisma.siteConfig.update({
      where: { id: config.id },
      data: {
        ...(type === 'logo' && { avatar: uploadResponse.url }),
        ...(type === 'banner' && { banner: uploadResponse.url }),
      },
    });

    return res.status(200).json({
      success: true,
      message: `${type} updated successfully`,
      url: uploadResponse.url,
      data: updated,
    });
  } catch (error) {
    console.error(`Upload Logo/Banner Error:`, error);
    return next(error);
  }
};

export const logoutAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('admin_access_token');
    res.clearCookie('admin_refresh_token');
    return res.status(200).json({
      success: true,
      message: 'Admin logged out successfully',
    });
  } catch (error) {
    console.error('Logout Admin Error:', error);
    return next(error);
  }
};

export const getAdminNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: 'admin',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({ notifications });
  } catch (error) {
    return next(error);
  }
};
