import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  CheckOtpRestriction,
  handleForgotPassword,
  handleVerifyForgotPasswordOtp,
  SendOtp,
  TrackOtp,
  ValidateData,
  verifyOtp,
} from '../utils/auth.helper';
import { AuthError, ValidationError } from '../../../../packages/error-handler';
import { prisma } from '../../../../packages/lib/prisma';
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
} from '../utils/cookies';
import Stripe from 'stripe';
import { sendLog } from '../../../../packages/lib/utils/sendlog';

type RefreshTokenPayload = {
  role: 'user' | 'seller' | 'Admin';
  email: string;
  userId?: string;
  sellerId?: string;
};

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Registration logic here
  try {
    const { email, name, password } = req.body;
    console.log('incoming req body', req.body);
    ValidateData({ email, name, password }, 'user');
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new ValidationError('User already exists'));
    }
    // Continue with registration process
    await CheckOtpRestriction(email, next);
    await TrackOtp(email, next);
    await SendOtp(email, name, 'user-activation-mail', next);

    res
      .status(201)
      .send('User registration initiated. Please verify your email.');
  } catch (error) {
    console.log('error here', error);
    next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, password, otp } = req.body;
    if (!email || !name || !password || !otp) {
      return next(new ValidationError('Missing required fields'));
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return next(new ValidationError('User already exists'));
    }
    await verifyOtp(email, otp.toString(), next);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'User',
      },
    });

    return res
      .status(200)
      .json({ message: 'User verified successfully', user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Forgot password logic here
  try {
    const { email } = req.body;
    console.log('incoming req body', req.body);
    if (!/\S+@\S+\.\S+/.test(email)) {
      return next(new ValidationError('Invalid email format'));
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return next(new ValidationError('User does not exist'));
    }
    await handleForgotPassword(email, next, existingUser.name, 'user');
    res.status(200).send('Password reset OTP sent to email.');
  } catch (error) {
    next(error);
  }
};

export const verifyUserForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Verify OTP logic here
  await handleVerifyForgotPasswordOtp(req, res, next);
  // try {
  //   const { email, otp } = req.body;
  //   if (!email || !otp) {
  //     return next (new ValidationError('Missing required fields'));
  //   }
  //   await verifyOtp(email, otp.toString(), next);
  //   res.status(200).send('OTP verified successfully.');
  // } catch (error) {
  //   next(error);
  // }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return new ValidationError('Missing required fields');
    }
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return next(new ValidationError('User does not exist'));
    }
    const isPasswordSame = await bcrypt.compare(
      newPassword,
      existingUser.password
    );
    if (isPasswordSame) {
      return new ValidationError(
        'New password must be different from the old password'
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).send('Password reset successfully.');
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Login logic here
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await prisma.users.findUnique({
      where: { email },
    });
    if (!user) {
      console.log('no user');
      return next(new AuthError('Invalid email or password'));
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('invalid user');
      return next(new AuthError('Invalid email or password'));
    }

    // res.clearCookie('seller_access_token');
    // res.clearCookie('seller_refresh_token');
    res.clearCookie('admin_access_token');
    res.clearCookie('admin_refresh_token');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: 'user',
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: 'user',
    });
    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken,
      isSeller: false,
    });
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
};

//handle refresh endpoint
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies?.refresh_token ||
      req.cookies?.seller_refresh_token ||
      req.cookies?.admin_refresh_token;

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

    const isSeller = decoded.role === 'seller';
    const isAdmin = decoded.role === 'Admin';

    const account = isSeller
      ? await prisma.sellers.findUnique({
          where: { id: decoded.sellerId },
        })
      : isAdmin
      ? await prisma.users.findUnique({
          where: { id: decoded.userId, role: 'Admin' },
        })
      : await prisma.users.findUnique({
          where: { id: decoded.userId },
        });

    if (!account || account.email !== decoded.email) {
      return next(new AuthError(`Forbidden: ${decoded.role} not found`));
    }

    const newAccessToken = signAccessToken({
      email: account.email,
      role: decoded.role,
      ...(isSeller ? { sellerId: account.id } : { userId: account.id }),
    });

    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken,
      isSeller,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const sellerRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.seller_refresh_token;

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

    const account = await prisma.sellers.findUnique({
      where: { id: decoded.sellerId },
    });

    if (!account || account.email !== decoded.email) {
      return next(new AuthError(`Forbidden: Seller not found`));
    }

    const newAccessToken = signAccessToken({
      email: account.email,
      role: decoded.role,
      sellerId: account.id,
    });

    setAuthCookies(res, {
      accessToken: newAccessToken,
      refreshToken,
      isSeller: true,
    });

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
};

//get login-user
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  await sendLog({
    type: 'success',
    message: `${user?.email} logged in successfully`,
    source: 'auth-service',
  });
  return res.status(200).json(user);
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    // res.clearCookie('seller_access_token');
    // res.clearCookie('seller_refresh_token');
    res.clearCookie('admin_access_token');
    res.clearCookie('admin_refresh_token');
    await sendLog({
      type: 'success',
      message: `${req.user?.email} logged out successfully`,
      source: 'auth-service',
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

export const testingEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name } = req.body;
    console.log('Testing endpoint hit with:', { email, name });
    res
      .status(200)
      .json({ message: 'Testing endpoint working', data: { email, name } });
  } catch (error) {
    next(error);
  }
};

export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone_number, country, password } = req.body;
    if (!name || !email || !phone_number || !country || !password) {
      return next(new ValidationError('Missing required field'));
    }
    ValidateData({ name, email, phone_number, country, password }, 'seller');
    const existingSeller = await prisma.sellers.findFirst({
      where: { email },
    });
    if (existingSeller) {
      return next(new AuthError('Seller already exists'));
    }
    await CheckOtpRestriction(email, next);
    await TrackOtp(email, next);
    await SendOtp(email, name, 'seller-activation-mail', next);

    res
      .status(201)
      .send('Seller registration initiated. Please verify your email.');
  } catch (error) {
    next(error);
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone_number, country, password, otp } = req.body;
    if (!email || !name || !password || !phone_number || !country || !otp) {
      return next(new ValidationError('Missing required fields'));
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError('Seller already exists'));
    }
    await verifyOtp(email, otp.toString(), next);
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone_number,
        country,
      },
      select: {
        id: true,
      },
    });

    return res
      .status(200)
      .json({ message: 'Seller verified successfully', seller });
  } catch (error) {
    next(error);
  }
};

//login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Login logic here
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Missing required field'));
    }
    const seller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (!seller) {
      console.log('no seller');
      return next(new AuthError('Invalid email or password'));
    }
    const isPasswordValid = await bcrypt.compare(password, seller.password);
    if (!isPasswordValid) {
      console.log('invalid seller');
      return next(new AuthError('Invalid email or password'));
    }
    // const isProd = process.env.NODE_ENV === 'production';

    // res.clearCookie('access_token', {
    //   httpOnly: true,
    //   secure: isProd,
    //   sameSite: isProd ? 'lax' : 'none',
    //   path: '/', // important
    // });
    // res.clearCookie('refresh_token', {
    //   httpOnly: true,
    //   secure: isProd,
    //   sameSite: isProd ? 'lax' : 'none',
    //   path: '/', // important
    // });

    // res.clearCookie('access_token');
    // res.clearCookie('refresh_token');
    const newAccessToken = signAccessToken({
      sellerId: seller.id,
      email: seller.email,
      role: 'seller',
    });
    const refreshToken = signRefreshToken({
      sellerId: seller.id,
      email: seller.email,
      role: 'seller',
    });
    console.log(newAccessToken);
    console.log(refreshToken);

    const isSeller = !!seller;
    console.log(isSeller);
    // const isProd = process.env.NODE_ENV === 'production';
    res.cookie('seller_access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 min
      path: '/',
      // domain: 'localhost',
    });

    res.cookie('seller_refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
      // domain: 'localhost',
    });
    // setAuthCookies(res, {
    //   accessToken: newAccessToken,
    //   refreshToken,
    //   isSeller,
    // });
    console.log('HEADERS BEFORE SEND:', res.getHeaders());
    console.log('NODE_ENV:', process.env.NODE_ENV);
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
};

export const forgotSellerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Forgot password logic here
  try {
    const { email } = req.body;
    console.log('incoming req body', req.body);
    if (!/\S+@\S+\.\S+/.test(email)) {
      return next(new ValidationError('Invalid email format'));
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (!existingSeller) {
      return next(new ValidationError('User does not exist'));
    }
    await handleForgotPassword(email, next, existingSeller.name, 'seller');
    res.status(200).send('Password reset OTP sent to email.');
  } catch (error) {
    next(error);
  }
};

export const verifySellerForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Verify OTP logic here
  await handleVerifyForgotPasswordOtp(req, res, next);
  // try {
  //   const { email, otp } = req.body;
  //   if (!email || !otp) {
  //     return next (new ValidationError('Missing required fields'));
  //   }
  //   await verifyOtp(email, otp.toString(), next);
  //   res.status(200).send('OTP verified successfully.');
  // } catch (error) {
  //   next(error);
  // }
};

export const resetSellerPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Reset password logic here
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return new ValidationError('Missing required fields');
    }
    const existingUser = await prisma.sellers.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return next(new ValidationError('Seller does not exist'));
    }
    const isPasswordSame = await bcrypt.compare(
      newPassword,
      existingUser.password
    );
    if (isPasswordSame) {
      return new ValidationError(
        'New password must be different from the old password'
      );
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.sellers.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).send('Password reset successfully.');
  } catch (error) {
    next(error);
  }
};

//get login-seller
export const getSeller = async (req: any, res: Response) => {
  const seller = req.seller;
  return res.status(200).json(seller);
};

//create shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;
    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError('Missing required fields'));
    }
    const shopData: {
      name: string;
      bio: string;
      address: string;
      opening_hours: string;
      website?: string;
      category: string;
      sellerId: string;
    } = { name, bio, address, opening_hours, category, sellerId };
    if (website) {
      shopData.website = website;
    }
    const existingShop = await prisma.shops.findUnique({
      where: { id: sellerId },
    });
    if (existingShop) {
      return next(new ValidationError('Shop already exists'));
    }
    const shop = await prisma.shops.create({
      data: shopData,
    });
    res.status(200).json({
      message: 'Shop created successfully',
      shop,
    });
  } catch (error) {
    next(error);
  }
};
//create seller stripe account and onboarding
export const createConnectedAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return next(new ValidationError('Missing required fields'));
    }
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
    });
    if (!seller) {
      return next(new AuthError('Seller not found'));
    }
    const account = await stripe.accounts.create({
      type: 'express',
      email: seller.email,
      country: 'GB',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: {
        stripeId: account.id,
      },
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_FRONTEND_URL}/success`,
      return_url: `${process.env.NEXT_FRONTEND_URL}/success`,
      type: 'account_onboarding',
    });
    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    next(error);
  }
};

export const logoutSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;
    if (!seller) {
      return next(new AuthError('Unauthorized'));
    }
    res.clearCookie('seller_access_token');
    res.clearCookie('seller_refresh_token');
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};
