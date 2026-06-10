import jwt from 'jsonwebtoken';
import { Response } from 'express';

type SetCookieOptions = {
  accessToken: string;
  refreshToken: string;
};

export const signAccessToken = (payload: object) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: '15m',
  });

export const signRefreshToken = (payload: object) =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: '7d',
  });

export function setAuthCookies(
  res: Response,
  { accessToken, refreshToken }: SetCookieOptions
) {
  const accessName = 'admin_access_token';
  const refreshName = 'admin_refresh_token';
  const isProd = process.env.NODE_ENV === 'production';
  console.log('isprod', isProd);
  res.cookie(accessName, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/',
  });

  res.cookie(refreshName, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}
