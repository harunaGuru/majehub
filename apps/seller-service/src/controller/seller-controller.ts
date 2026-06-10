import { NextFunction, Request, Response } from 'express';
import { prisma } from '@packages/lib/prisma';
import { imagekit } from '../../../../packages/lib/imagekit';
import { AuthError, ValidationError } from '../../../../packages/error-handler';

export const getAllShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = '1', limit = '10', category } = req.query;

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;

    const skip = (pageNumber - 1) * pageSize;

    const where: any = {
      isDeleted: false,
    };
    if (category) {
      const categories = (category as string)
        .split(',')
        .map((c) => c.trim().toLowerCase());

      where.OR = categories.map((cat) => ({
        category: {
          contains: cat,
          mode: 'insensitive',
        },
      }));
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
        // include: {
        //   products: true, // optional (can remove if heavy)
        //   sellers: true, // optional
        // },
      }),
      prisma.shops.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      shops,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getShopById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;

    if (!shopId) {
      return next(new ValidationError('Missing required field'));
    }

    const shop = await prisma.shops.findFirst({
      where: {
        id: shopId,
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        bio: true,
        address: true,
        avatar: true,
        coverBanner: true,
        category: true,
        opening_hours: true,
        ratings: true,
        website: true,
        socialLinks: true,
        createdAt: true,
      },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found'));
    }

    const followersCount = await prisma.followers.count({
      where: { shopId: shopId },
    });

    return res.status(200).json({
      success: true,
      shop: {
        ...shop,
        followersCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const followShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { shopId } = req.body;
    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const shopExists = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true },
    });
    if (!shopExists) {
      return next(new ValidationError('Shop not found'));
    }

    const isFollowing = await prisma.followers.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });
    if (isFollowing) {
      return res.status(200).json({
        success: true,
        message: 'You are already following this shop',
      });
    }
    const follow = await prisma.followers.create({
      data: {
        userId,
        shopId,
      },
    });

    return res.status(200).json({
      message: 'Shop followed successfully',
      follow,
    });
  } catch (error) {
    next(error);
  }
};

export const unFollowShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }
    const existingFollow = await prisma.followers.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });
    if (!existingFollow) {
      return next(new ValidationError('You are not following this shop'));
    }

    await prisma.followers.delete({
      where: {
        id: existingFollow.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Shop unfollowed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getShopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const shopExists = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true, sellerId: true },
    });
    console.log('shopExists', shopExists);
    if (!shopExists) {
      return next(new ValidationError('Shop not found'));
    }
    let data: any = [];

    const where = {
      shopId,
      starting_date: null,
    };

    const [products, count] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          totalSales: true,

          images: {
            select: {
              id: true,
              fileUrl: true,
            },
          },
        },
      }),

      prisma.products.count({ where }),
    ]);

    data = products.map((p: any) => ({
      ...p,
      images: p.images.map((img: any) => ({
        id: img.id,
        fileUrl: img.fileUrl,
      })),
      shop: {
        id: shopExists.id,
      },
    }));
    return res.status(200).json({
      success: true,
      result: data,
      meta: {
        count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getShopReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const shopExists = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true, sellerId: true },
    });
    console.log('shopExists', shopExists);
    if (!shopExists) {
      return next(new ValidationError('Shop not found'));
    }
    let data: any = [];

    const where = {
      shopId,
    };

    const [reviews, count] = await Promise.all([
      prisma.shopReviews.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          rating: true,
          reviews: true,
          createdAt: true,

          user: {
            select: {
              id: true,
              name: true,
              avatar: {
                select: {
                  fileUrl: true,
                },
              },
            },
          },
        },
      }),

      prisma.shopReviews.count({ where }),
    ]);

    data = reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      reviews: r.reviews,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        image: r.user.avatar?.fileUrl || null,
      },
    }));
    return res.status(200).json({
      success: true,
      result: data,
      meta: {
        count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getShopEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const shopExists = await prisma.shops.findUnique({
      where: { id: shopId },
      select: { id: true, sellerId: true },
    });
    console.log('shopExists', shopExists);
    if (!shopExists) {
      return next(new ValidationError('Shop not found'));
    }
    let data: any = [];

    const where = {
      shopId,
      starting_date: {
        not: null,
      },
    };

    const [events, count] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          totalSales: true,

          images: {
            select: {
              id: true,
              fileUrl: true,
            },
          },
        },
      }),

      prisma.products.count({ where }),
    ]);

    data = events.map((e: any) => ({
      ...e,
      images: e.images.map((img: any) => ({
        id: img.id,
        fileUrl: img.fileUrl,
      })),
      shop: {
        id: shopExists.id,
      },
    }));
    return res.status(200).json({
      success: true,
      result: data,
      meta: {
        count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const isFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { shopId } = req.params;

    if (!shopId) {
      return next(new ValidationError('Shop ID is required'));
    }

    const existingFollow = await prisma.followers.findUnique({
      where: {
        userId_shopId: {
          userId,
          shopId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      isFollowing: !!existingFollow,
    });
  } catch (error) {
    next(error);
  }
};

export const editSellerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;

    if (!seller?.id) {
      return next(new ValidationError('Unauthorized'));
    }

    const { name, bio, opening_hours, address, website, socialLinks } =
      req.body;
    console.log('req.body', req.body);
    if (!name || !bio || !opening_hours || !address || !website) {
      return next(new ValidationError('All fields are required'));
    }

    const existingShop = await prisma.shops.findUnique({
      where: { sellerId: seller.id },
    });

    if (!existingShop) {
      return next(new ValidationError('Shop not found'));
    }
    const existingLinks = (existingShop?.socialLinks || []) as any[];
    const incomingLinks = socialLinks || [];
    const map = new Map<string, string>();
    existingLinks.forEach((link: any) => {
      map.set(link.name, link.value);
    });
    incomingLinks.forEach((link: any) => {
      if (link.value) {
        map.set(link.name, link.value);
      }
    });
    const mergedSocialLinks = Array.from(map.entries()).map(
      ([name, value]) => ({ name, value })
    );
    const updatedShop = await prisma.shops.update({
      where: { sellerId: seller.id },
      data: {
        name,
        bio,
        opening_hours,
        address,
        website,
        socialLinks: mergedSocialLinks,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      shop: updatedShop,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;

    if (!seller?.id) {
      return next(new ValidationError('Unauthorized'));
    }

    const shop = await prisma.shops.findUnique({
      where: { sellerId: seller.id },
      include: {
        followers: true,
        reviews: true,
      },
    });

    if (!shop) {
      return res.status(200).json({
        success: true,
        message: 'No shop found, return defaults',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: shop.id,
        name: shop.name,
        bio: shop.bio,
        address: shop.address,
        opening_hours: shop.opening_hours,
        website: shop.website,
        avatar: shop.avatar,
        coverBanner: shop.coverBanner,
        socialLinks: shop.socialLinks,
        rating: shop.ratings,
        followersCount: shop.followers.length,
        reviewsCount: shop.reviews.length,
        createdAt: shop.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateShopBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;

    if (!seller?.id) {
      return next(new ValidationError('Unauthorized'));
    }
    const shop = await prisma.shops.findUnique({
      where: { sellerId: seller.id },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found'));
    }

    const { file, fileName, folder = '/banner-upload' } = req.body;
    console.log(fileName);

    if (!file || !fileName) {
      return next(new ValidationError('Missing required field'));
    }

    const uploadResponse = await imagekit.upload({
      file, // base64 string
      fileName,
      folder,
    });

    console.log('uploadResponse', uploadResponse);
    if (!uploadResponse.fileId) {
      return res.status(200).json({
        success: false,
        message: 'Failed to upload image',
        data: null,
      });
    }
    const updated = await prisma.shops.update({
      where: { sellerId: seller.id },
      data: {
        coverBanner: uploadResponse.url,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Images updated successfully',
      data: {
        coverBanner: updated.coverBanner,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateShopAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;

    if (!seller?.id) {
      return next(new ValidationError('Unauthorized'));
    }
    const shop = await prisma.shops.findUnique({
      where: { sellerId: seller.id },
    });

    if (!shop) {
      return next(new ValidationError('Shop not found'));
    }

    const { file, fileName, folder = '/banner-upload' } = req.body;
    console.log(fileName);

    if (!file || !fileName) {
      return next(new ValidationError('Missing required field'));
    }

    const uploadResponse = await imagekit.upload({
      file, // base64 string
      fileName,
      folder,
    });

    console.log('uploadResponse', uploadResponse);
    if (!uploadResponse.fileId) {
      return res.status(200).json({
        success: false,
        message: 'Failed to upload image',
        data: null,
      });
    }
    const updated = await prisma.shops.update({
      where: { sellerId: seller.id },
      data: {
        avatar: uploadResponse.url,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Images updated successfully',
      data: {
        avatar: updated.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;
    const shopId = seller.shop.id;
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    if (!shopId || !seller?.id) {
      return next(new AuthError('Unauthorized'));
    }

    let data: any = [];

    const where = {
      shopId,
      starting_date: null,
    };

    const [products, count] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          totalSales: true,

          images: {
            select: {
              id: true,
              fileUrl: true,
            },
          },
        },
      }),

      prisma.products.count({ where }),
    ]);

    data = products.map((p: any) => ({
      ...p,
      images: p.images.map((img: any) => ({
        id: img.id,
        url: img.fileUrl,
      })),
    }));
    return res.status(200).json({
      success: true,
      result: data,
      meta: {
        count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;
    const shopId = seller.shop.id;
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    if (!shopId || !seller?.id) {
      return next(new AuthError('Unauthorized'));
    }

    let data: any = [];

    const where = {
      shopId,
    };

    const [reviews, count] = await Promise.all([
      prisma.shopReviews.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          rating: true,
          reviews: true,
          createdAt: true,

          user: {
            select: {
              id: true,
              name: true,
              avatar: {
                select: {
                  fileUrl: true,
                },
              },
            },
          },
        },
      }),

      prisma.shopReviews.count({ where }),
    ]);

    data = reviews.map((r: any) => ({
      id: r.id,
      rating: r.rating,
      reviews: r.reviews,
      createdAt: r.createdAt,
      user: {
        id: r.user.id,
        name: r.user.name,
        image: r.user.avatar?.fileUrl || null,
      },
    }));
    return res.status(200).json({
      success: true,
      result: data,
      meta: {
        count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = (req as any).seller;
    const shopId = seller.shop.id;
    const { page = '1', limit = '10' } = req.query;
    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * pageSize;

    if (!shopId || !seller?.id) {
      return next(new AuthError('Unauthorized'));
    }

    let data: any = [];

    const where = {
      shopId,
      starting_date: {
        not: null,
      },
    };

    const [events, count] = await Promise.all([
      prisma.products.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },

        select: {
          id: true,
          title: true,
          slug: true,
          sale_price: true,
          regular_price: true,
          stock: true,
          totalSales: true,
          starting_date: true,
          ending_date: true,

          images: {
            select: {
              id: true,
              fileUrl: true,
            },
          },
        },
      }),

      prisma.products.count({ where }),
    ]);

    data = events.map((e: any) => ({
      ...e,
      images: e.images.map((img: any) => ({
        id: img.id,
        url: img.fileUrl,
      })),
    }));
    return res.status(200).json({
      success: true,
      result: data,
      meta: {
        count,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    if (!sellerId) {
      return next(new AuthError('Unauthorized'));
    }
    const shop = await prisma.shops.findUnique({
      where: {
        sellerId,
      },
    });
    if (!shop) {
      return next(new AuthError('Shop not found'));
    }
    if (shop.isDeleted && shop.deletedAt && shop.deletedAt > new Date()) {
      return next(
        new ValidationError('Shop is already deleted, You can restore shop')
      );
    }
    await prisma.shops.update({
      where: {
        id: shop.id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const restoreShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;
    if (!sellerId) {
      return next(new AuthError('Unauthorized'));
    }
    const shop = await prisma.shops.findUnique({
      where: {
        sellerId,
      },
    });
    if (!shop) {
      return next(new AuthError('Shop not found'));
    }
    if (!shop.isDeleted || !shop.deletedAt) {
      return next(new ValidationError('Shop is not deleted'));
    }
    await prisma.shops.update({
      where: {
        id: shop.id,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
    return res.status(200).json({
      success: true,
      message: 'Shop restored successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getSellerNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req?.seller?.id;

    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: sellerId,
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

export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return next(new ValidationError('Notification ID is required'));
    }

    const notification = await prisma.notifications.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return next(new ValidationError('Notification not found'));
    }

    await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: 'Read' },
    });

    return res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    return next(error);
  }
};
