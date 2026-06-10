import { NextFunction, Request, Response } from 'express';
import { imagekit } from '../../../../packages/lib/imagekit';
import { addHours } from 'date-fns';
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from '../../../../packages/error-handler';
import { prisma } from '@packages/lib/prisma';

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, fileName, folder = '/uploads' } = req.body;

    if (!file || !fileName) {
      return next(new ValidationError('Missing required field'));
    }

    const uploadResponse = await imagekit.upload({
      file, // base64 string
      fileName,
      folder,
    });
    return res.json({
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.params;
    if (!fileId) {
      return next(new ValidationError('Missing required field'));
    }

    await imagekit.deleteFile(fileId);

    return res.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
) => {
  try {
    const { discountCode, public_name, discountType, discountValue } = req.body;
    if (!discountCode || !discountType || !discountValue || !public_name) {
      return next(new ValidationError('Missing required field'));
    }
    const seller = req.seller;
    if (!seller) {
      return next(new ValidationError('Seller not found'));
    }
    const existingDiscount = await prisma.discount_code.findUnique({
      where: { discountCode },
    });
    if (existingDiscount) {
      return next(
        new ValidationError(
          'Discount already exists, please use a different code'
        )
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
  next: NextFunction
) => {
  try {
    const { id } = req.params;
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
  next: NextFunction
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
  next: NextFunction
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
        new ValidationError('At least one product image is required')
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
          'Both starting_date and ending_date must be provided for an event product'
        )
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
          new ValidationError('ending_date must be after starting_date')
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
    next(error);
  }
};

export const editProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const seller = req.seller;

    const existingProduct = await prisma.products.findFirst({
      where: {
        id: productId,
        shopId: seller?.shop.id,
      },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return next(new NotFoundError('Product not found'));
    }

    const {
      title,
      short_Description,
      detailed_description,
      slug,
      sale_price,
      regular_price,
      brand,
      warranty,
      // images,
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

    // Nothing sent
    if (!Object.keys(req.body).length) {
      return res.status(200).json({
        success: true,
        message: 'No changes provided',
        product: existingProduct,
      });
    }

    if (slug && slug !== existingProduct.slug) {
      const slugExists = await prisma.products.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return next(new ValidationError('Product slug already exists'));
      }
    }

    if (
      sale_price !== undefined &&
      (isNaN(Number(sale_price)) || Number(sale_price) < 0)
    ) {
      return next(new ValidationError('Invalid sale price'));
    }

    if (
      regular_price !== undefined &&
      (isNaN(Number(regular_price)) || Number(regular_price) < 0)
    ) {
      return next(new ValidationError('Invalid regular price'));
    }

    if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) {
      return next(new ValidationError('Invalid stock value'));
    }

    const hasStart = starting_date !== undefined;
    const hasEnd = ending_date !== undefined;

    let parsedStart = undefined;
    let parsedEnd = undefined;

    if (hasStart || hasEnd) {
      const startDate = starting_date
        ? new Date(starting_date)
        : existingProduct.starting_date;

      const endDate = ending_date
        ? new Date(ending_date)
        : existingProduct.ending_date;

      if (!startDate || !endDate) {
        return next(
          new ValidationError('Both starting_date and ending_date are required')
        );
      }

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return next(new ValidationError('Invalid date format'));
      }

      if (startDate >= endDate) {
        return next(
          new ValidationError('ending_date must be after starting_date')
        );
      }

      parsedStart = startDate;
      parsedEnd = endDate;
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (short_Description !== undefined)
      updateData.short_Description = short_Description;

    if (detailed_description !== undefined)
      updateData.detailed_description = detailed_description;

    if (slug !== undefined) updateData.slug = slug;

    if (sale_price !== undefined) updateData.sale_price = Number(sale_price);

    if (regular_price !== undefined)
      updateData.regular_price =
        regular_price === null ? null : Number(regular_price);

    if (brand !== undefined) updateData.brand = brand;
    if (warranty !== undefined) updateData.warranty = warranty;

    if (colors !== undefined)
      updateData.colors = Array.isArray(colors) ? colors : [];

    if (sizes !== undefined)
      updateData.sizes = Array.isArray(sizes) ? sizes : [];

    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];

    if (category !== undefined) updateData.category = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory;

    if (customProperties !== undefined)
      updateData.custom_properties = customProperties;

    if (custom_specification !== undefined)
      updateData.custom_specification = custom_specification;

    if (cashOnDelivery !== undefined)
      updateData.cashOnDelivery = cashOnDelivery;

    if (discount_code !== undefined)
      updateData.discount_code = Array.isArray(discount_code)
        ? discount_code
        : [];

    if (video_url !== undefined) updateData.video_url = video_url;

    if (stock !== undefined) updateData.stock = Number(stock);

    if (parsedStart !== undefined) updateData.starting_date = parsedStart;

    if (parsedEnd !== undefined) updateData.ending_date = parsedEnd;

    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      // if (images !== undefined) {
      //   await tx.productImage.deleteMany({
      //     where: {
      //       productId: productId,
      //     },
      //   });

      //   if (Array.isArray(images) && images.length) {
      //     await tx.productImage.createMany({
      //       data: images.map((img: any) => ({
      //         productId,
      //         fileUrl: img.fileUrl,
      //         fileId: img.fileId,
      //       })),
      //     });
      //   }
      // }

      return tx.products.update({
        where: {
          id: productId,
        },
        data: updateData,
        // include: {
        //   images: true,
        // },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestAndTopProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
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
      OR: [{ starting_date: null }, { ending_date: null }],
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
export const getLatestOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const whereCondition = {
      isDeleted: false,
      shop: {
        isDeleted: false,
      },
      OR: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
    };
    const [products, totalCount] = await Promise.all([
      prisma.products.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
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
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const shopId = seller?.shop.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const whereCondition: any = {
      shopId,
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
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const shopId = seller?.shop.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    // const now = new Date();

    const whereCondition = {
      shopId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }),
      AND: [{ starting_date: { not: null } }, { ending_date: { not: null } }],
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
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return next(new ValidationError('Valid product id is required'));
    }
    if (!seller) {
      return next(
        new ValidationError('Authentication and Authorization required')
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
        new ValidationError('Product already scheduled for deletion')
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
  next: NextFunction
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
          'Restore window has expired. Product cannot be restored.'
        )
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
  next: NextFunction
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
            sellerId: true,
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
  next: NextFunction
) => {
  try {
    const {
      PriceRange,
      category,
      subcategory,
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
      where.AND.push({
        OR: categories.map((c: string) => ({
          category: {
            equals: c,
            mode: 'insensitive',
          },
        })),
      });
    }
    if (subcategory) {
      const subCategories = (subcategory as string)
        .toLowerCase()
        .split(',')
        .map((c) => c.trim());
      where.AND.push({
        OR: subCategories.map((c: string) => ({
          subCategory: {
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
  next: NextFunction
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

export const getTopShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const aggregatedShops = await prisma.orders.aggregateRaw({
      pipeline: [
        {
          $match: {
            shopId: {
              $exists: true,
              $ne: null,
            },
          },
        },
        {
          $group: {
            _id: '$shopId',
            totalOrders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            totalOrders: -1,
          },
        },
        {
          $limit: 10,
        },
      ],
    });
    if (!aggregatedShops.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // const shopIds = aggregatedShops.map((shop: any) => shop._id as string);

    const aggregatedResults = (aggregatedShops as any[]).map((item) => ({
      shopId: typeof item._id === 'string' ? item._id : item._id.$oid,
      totalOrders: Number(item.totalOrders),
    }));

    const shopIds = aggregatedResults.map((item) => item.shopId);

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        ratings: true,
        address: true,
        category: true,
        followers: {
          select: {
            id: true,
          },
        },
      },
    });

    const shopMap = new Map(
      shops.map((shop: any) => [
        shop.id,
        {
          id: shop.id,
          name: shop.name,
          avatar: shop.avatar,
          coverBanner: shop.coverBanner,
          ratings: shop.ratings,
          address: shop.address,
          category: shop.category,
          followers: shop.followers.length,
        },
      ])
    );

    const topShops = aggregatedResults
      .map((item: any) => {
        const shop = shopMap.get(item.shopId);

        if (!shop) return null;

        return {
          ...shop,
          totalOrders: Number(item.totalOrders),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      data: topShops,
    });
  } catch (error) {
    return next(error);
  }
};

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length === 0) {
      return next(new ValidationError('search field is required'));
    }
    const products = await prisma.products.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { short_Description: { contains: query, mode: 'insensitive' } },
        ],
        isDeleted: false,
      },
      select: {
        slug: true,
        id: true,
        title: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
};
