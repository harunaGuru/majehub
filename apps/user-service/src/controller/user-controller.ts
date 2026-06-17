import { NextFunction, Request, Response } from 'express';
import { prisma } from '../../../../packages/lib/prisma';
import { ValidationError } from '../../../../packages/error-handler';
import { imagekit } from '../../../../packages/lib/imagekit';

export const uploadUserImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { file, fileName, folder = 'user' } = req.body;

    if (!userId) {
      return next(new ValidationError('Unauthorized'));
    }

    if (!file || !fileName) {
      return next(new ValidationError('Missing required fields'));
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { avatar: true },
    });

    if (!user) {
      return next(new ValidationError('User not found'));
    }

    const uploadResponse = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    const newImage = await prisma.images.create({
      data: {
        fileId: uploadResponse.fileId,
        fileUrl: uploadResponse.url,
      },
    });

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        imagesId: newImage.id,
      },
      include: { avatar: true },
    });

    if (user.avatar) {
      prisma.images
        .delete({ where: { id: user.avatar.id } })
        .catch(console.error);
      imagekit.deleteFile(user.avatar.fileId).catch(console.error);
    }

    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

export const getUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new ValidationError('Unauthorized'));
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Get Address Error:', error);
    return next(error);
  }
};

export const addUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const {
      label,
      name,
      street,
      city,
      country,
      zip,
      isDefault = false,
    } = req.body;

    if (!userId) {
      return next(new ValidationError('Unauthorized'));
    }

    const existingCount = await prisma.address.count({
      where: { userId },
    });

    let makeDefault = false;

    if (existingCount === 0) {
      makeDefault = true;
    } else if (isDefault) {
      makeDefault = true;
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        label,
        name,
        street,
        city,
        country,
        zip,
        isDefault: makeDefault,
      },
    });

    res.status(201).json({
      success: true,
      data: newAddress,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    if (!addressId) {
      return next(new ValidationError('Address ID is required'));
    }
    if (!userId) {
      return next(new ValidationError('Unauthorized'));
    }
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      return next(new ValidationError('Address not found'));
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    if (address.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: userId,
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
