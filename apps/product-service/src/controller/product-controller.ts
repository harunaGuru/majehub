import { NextFunction, Request, Response } from 'express';
import { imagekit } from '../../../../packages/lib/imagekit';
import { addHours } from 'date-fns';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { prisma } from '@packages/lib/prisma';

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { file, fileName, folder = '/uploads' } = req.body;
    console.log(fileName);

    if (!file || !fileName) {
      return next(new ValidationError('Missing required field'));
    }

    const uploadResponse = await imagekit.upload({
      file, // base64 string
      fileName, // e.g image.png
      folder,
    });
    console.log('uploadResponse', uploadResponse);
    return res.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fileId } = req.params;
    console.log('deleteImageFileId', fileId);
    if (!fileId) {
      return next(new ValidationError('Missing required field'));
    }

    await imagekit.deleteFile(fileId);

    return res.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    console.error('Image delete error:', error);
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const config = await prisma.siteConfig.findFirst({
      select: {
        categories: true,
        subCategories: true,
      },
    });
    if (!config) {
      return next(new ValidationError('Category not found'));
    }
    return res.json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    next(error);
  }
};
export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { discountCode, public_name, discountType, discountValue } = req.body;
    console.log('discount-content', {
      discountCode,
      discountType,
      discountValue,
      public_name,
    });
    if (!discountCode || !discountType || !discountValue || !public_name) {
      return next(new ValidationError('Missing required field'));
    }

    const seller = req.seller;
    console.log(seller?.id);
    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }
    const existingDiscount = await prisma.discount_code.findUnique({
      where: { discountCode },
    });
    if (existingDiscount) {
      return next(
        new ValidationError(
          'Discount already exists, please use a different code',
        ),
      );
    }
    const discount = await prisma.discount_code.create({
      data: {
        discountCode,
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        sellerId: seller.id,
      },
    });
    return res.status(201).json({
      success: true,
      discount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    console.log('deleteDiscount', id);
    if (!id) {
      return next(new ValidationError('Missing required field'));
    }
    const seller = req.seller;
    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }
    const existingDiscount = await prisma.discount_code.findUnique({
      where: { id },
      select: {
        id: true,
        sellerId: true,
      },
    });
    if (!existingDiscount) {
      return next(new ValidationError('Discount does not exists'));
    }
    if (existingDiscount.sellerId !== seller.id) {
      return next(new AuthError('Unauthorized Access!'));
    }
    await prisma.discount_code.delete({
      where: { id },
    });
    return res.status(200).json({
      message: 'Discount deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getShopDiscounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const existingDiscount = await prisma.discount_code.findMany({
      where: { sellerId: req.seller?.id },
    });
    if (!existingDiscount) {
      return next(new ValidationError('Discount does not exists'));
    }
    return res.status(201).json({
      success: true,
      discounts: existingDiscount,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      title,
      short_Description,
      detailed_description,
      slug,
      sale_price,
      regular_price,
      brand,
      warranty,
      images,
      colors,
      sizes,
      tags,
      category,
      subCategory,
      customProperties,
      custom_specification,
      cashOnDelivery,
      discount_code,
      starting_date,
      ending_date,
      stock,
      video_url,
    } = req.body;
    const seller = req.seller;
    console.log('seller', seller);
    console.log('seller shop id', seller?.shop.id);
    if (
      !title ||
      !sale_price ||
      !category ||
      !subCategory ||
      !stock ||
      !slug ||
      !images ||
      !short_Description ||
      !detailed_description
    ) {
      return next(new ValidationError('Missing required field'));
    }

    // Ensure at least one image is uploaded
    if (!images || !Array.isArray(images) || images.length === 0) {
      return next(
        new ValidationError('At least one product image is required'),
      );
    }

    const existingSlug = await prisma.products.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return next(new ValidationError('Product slug already exists'));
    }
    //Events
    const hasStart = !!starting_date;
    const hasEnd = !!ending_date;

    if ((hasStart && !hasEnd) || (!hasStart && hasEnd)) {
      return next(
        new ValidationError(
          'Both starting_date and ending_date must be provided for an event product',
        ),
      );
    }

    let parsedStart = null;
    let parsedEnd = null;

    if (hasStart && hasEnd) {
      parsedStart = new Date(starting_date);
      parsedEnd = new Date(ending_date);

      // Invalid date format
      if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
        return next(new ValidationError('Invalid date format'));
      }

      if (parsedStart >= parsedEnd) {
        return next(
          new ValidationError('ending_date must be after starting_date'),
        );
      }

      const now = new Date();
      if (parsedStart < now) {
        return next(new ValidationError('Event cannot start in the past'));
      }
    }
    const insertData = {
      title,
      short_Description: short_Description || '',
      detailed_description: detailed_description || '',
      slug,

      sale_price: parseFloat(sale_price),
      regular_price: regular_price ? parseFloat(regular_price) : null,

      brand: brand || null,
      warranty: warranty || null,

      images: {
        create: images.map((img) => ({
          fileUrl: img.fileUrl,
          fileId: img.fileId,
        })),
      },
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      tags: Array.isArray(tags) ? tags : [],

      category,
      subCategory,

      starting_date: parsedStart,
      ending_date: parsedEnd,

      custom_properties: customProperties || [],
      custom_specification: custom_specification || [],

      cashOnDelivery: cashOnDelivery || 'no',

      discount_code: Array.isArray(discount_code) ? discount_code : [],

      video_url: video_url || null,

      stock: parseInt(stock),

      shopId: seller?.shop.id,
    };

    const product = await prisma.products.create({
      data: insertData,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    console.error(error);
    next(error);
  }
};

export const getLatestAndTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const type = req.query.type || 'latest';
    const skip = (page - 1) * limit;

    const whereCondition = {
      isDeleted: false,
      shop: {
        isDeleted: false,
      },
      // OR: [{ starting_date: null }, { ending_date: null }],
    };
    let orderBy = {};

    if (type === 'latest') {
      orderBy = { createdAt: 'desc' };
    } else {
      orderBy = { totalSales: 'desc' };
    }
    const [products, totalCount] = await Promise.all([
      prisma.products.findMany({
        where: whereCondition,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            select: {
              id: true,
              fileUrl: true,
            },
          },
          shop: true,
        },
      }),
      prisma.products.count({
        where: whereCondition,
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getAllShopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const whereCondition: any = {
      // isDeleted: false,
      AND: [
        {
          OR: [{ starting_date: null }, { ending_date: null }],
        },

        ...(search
          ? [
              {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { category: { contains: search, mode: 'insensitive' } },
                  { brand: { contains: search, mode: 'insensitive' } },
                ],
              },
            ]
          : []),
      ],
    };

    const [totalProducts, products] = await Promise.all([
      prisma.products.count({
        where: whereCondition,
      }),
      prisma.products.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
          shop: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      meta: {
        total: totalProducts,
        page,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllShopEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const now = new Date();

    const whereCondition = {
      // isDeleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
      AND: [
        { starting_date: { not: null, lte: now } },
        { ending_date: { not: null, gte: now } },
      ],
    };

    const [totalProducts, products] = await Promise.all([
      prisma.products.count({
        where: whereCondition,
      }),
      prisma.products.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
          shop: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      products,
      meta: {
        total: totalProducts,
        page,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const softDelete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return next(new ValidationError('Valid product id is required'));
    }
    if (!seller) {
      return next(
        new ValidationError('Authentication and Authorization required'),
      );
    }
    const product = await prisma.products.findUnique({
      where: { id },
      select: {
        id: true,
        shop: {
          select: { sellerId: true },
        },
        isDeleted: true,
      },
    });
    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    if (product.shop.sellerId !== seller.id) {
      return next(new AuthError('Access denied'));
    }

    if (product.isDeleted) {
      return next(
        new ValidationError('Product already scheduled for deletion'),
      );
    }
    const deletionDate = addHours(new Date(), 24);
    await prisma.products.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: deletionDate,
      },
    });
    return res.status(200).json({
      success: true,
      message: `Product scheduled for deletion on ${deletionDate.toDateString()}`,
      deletionDate,
    });
  } catch (error) {
    next(error);
  }
};

export const restoreProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return next(new ValidationError('Valid product id is required'));
    }

    if (!seller) {
      return next(new AuthError('Authentication required'));
    }

    const product = await prisma.products.findUnique({
      where: { id },
      select: {
        id: true,
        shop: {
          select: { sellerId: true },
        },
        isDeleted: true,
        deletedAt: true,
      },
    });

    if (!product) {
      return next(new ValidationError('Product not found'));
    }

    if (product.shop.sellerId !== seller.id) {
      return next(new AuthError('Access denied'));
    }

    if (!product.isDeleted) {
      return next(new ValidationError('Product is not scheduled for deletion'));
    }

    const now = new Date();
    if (product.deletedAt <= now) {
      return next(
        new ValidationError(
          'Restore window has expired. Product cannot be restored.',
        ),
      );
    }

    await prisma.products.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Product successfully restored.',
    });
  } catch (error) {
    next(error);
  }
};
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return next(new ValidationError('Product slug is required'));
    }
    const product = await prisma.products.findFirst({
      where: {
        slug,
        isDeleted: false,
      },
      include: {
        images: true,
        shop: {
          select: {
            id: true,
            name: true,
            avatar: true,
            address: true,
            ratings: true,
            reviews: true,
          },
        },
      },
    });
    if (!product) {
      return next(new ValidationError('Product not found'));
    }
    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      PriceRange,
      category,
      color,
      size,
      page = '1',
      limit = '20',
    } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const normalize = (value: string) =>
      value
        .toLowerCase()
        .split(',')
        .map((v) => v.trim());
    const where: any = {
      isDeleted: false,
      AND: [
        {
          OR: [{ starting_date: null }, { ending_date: null }],
        },
      ],
    };
    if (PriceRange) {
      const [minPrice, maxPrice] = (PriceRange as string)
        .split(',')
        .map((p) => parseFloat(p));
      where.AND.push({
        sale_price: {
          gte: minPrice,
          lte: maxPrice,
        },
      });
    }
    if (category) {
      const categories = (category as string)
        .toLowerCase()
        .split(',')
        .map((c) => c.trim());
      console.log('categories', categories);
      where.AND.push({
        OR: categories.map((c: string) => ({
          category: {
            equals: c,
            mode: 'insensitive',
          },
        })),
      });
    }
    if (color) {
      const colors = normalize(color as string);
      where.AND.push({
        OR: colors.map((c) => ({
          colors: { has: c }, // MongoDB array contains
        })),
      });
    }
    if (size) {
      const sizes = (size as string).split(',');
      where.AND.push({
        OR: sizes.map((s) => ({
          sizes: { has: s }, // MongoDB array contains
        })),
      });
    }
    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { images: true, shop: true },
      }),
    ]);
    return res.json({
      products,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllOffers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      PriceRange,
      category,
      color,
      size,
      page = '1',
      limit = '20',
    } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const normalize = (value: string) =>
      value
        .toLowerCase()
        .split(',')
        .map((v) => v.trim());
    const where: any = {
      isDeleted: false,
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
    };
    if (PriceRange) {
      const [minPrice, maxPrice] = (PriceRange as string)
        .split(',')
        .map((p) => parseFloat(p));
      where.AND.push({
        sale_price: {
          gte: minPrice,
          lte: maxPrice,
        },
      });
    }
    if (category) {
      const categories = (category as string)
        .toLowerCase()
        .split(',')
        .map((c) => c.trim());
      console.log('categories', categories);
      where.AND.push({
        OR: categories.map((c: string) => ({
          category: {
            equals: c,
            mode: 'insensitive',
          },
        })),
      });
    }
    if (color) {
      const colors = normalize(color as string);
      where.AND.push({
        OR: colors.map((c) => ({
          colors: { has: c }, // MongoDB array contains
        })),
      });
    }
    if (size) {
      const sizes = (size as string).split(',');
      where.AND.push({
        OR: sizes.map((s) => ({
          sizes: { has: s }, // MongoDB array contains
        })),
      });
    }
    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { images: true, shop: true },
      }),
    ]);
    return res.json({
      products,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    });
  } catch (error) {
    return next(error);
  }
};
