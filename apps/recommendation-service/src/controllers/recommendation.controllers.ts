import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../../../packages/lib/prisma';
import { productsRecommendation } from '../services/recommendationService';
import { ValidationError } from '../../../../packages/error-handler';

export const getRecommendedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new ValidationError('User is not authenticated'));
    }
    const allproducts = await prisma.products.findMany({
      include: {
        images: true,
        shop: true,
      },
    });
    let userAnalytics = await prisma.userAnalytics.findUnique({
      where: {
        userId: userId,
      },
      select: {
        actions: true,
        recommendations: true,
        lastTrained: true,
      },
    });
    const now = new Date();
    let recommendedProducts: any[] = [];

    if (!userAnalytics) {
      recommendedProducts = allproducts.slice(0, 10);
    }

    const recommendations = (userAnalytics?.recommendations as string[]) || [];
    const actions = Array.isArray(userAnalytics?.actions)
      ? userAnalytics.actions
      : [];
    const lastTrained = userAnalytics?.lastTrained
      ? new Date(userAnalytics.lastTrained)
      : null;
    const hoursDiff = lastTrained
      ? Math.floor((now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60))
      : Infinity;
    if (actions.length < 50) {
      recommendedProducts = allproducts.slice(0, 10);
    } else if (hoursDiff < 3 && recommendations.length > 0) {
      recommendedProducts = allproducts.filter((product) =>
        recommendations.includes(product.id)
      );
    } else {
      const recommendedProductIds = await productsRecommendation(
        userId,
        allproducts
      );
      recommendedProducts = allproducts.filter((product) =>
        recommendedProductIds.includes(product.id)
      );
      await prisma.userAnalytics.update({
        where: {
          userId: userId,
        },
        data: {
          recommendations: recommendedProductIds,
          lastTrained: now,
        },
      });
    }
    res.status(200).json({
      success: true,
      data: recommendedProducts,
    });
  } catch (error) {
    next(error);
  }
};
