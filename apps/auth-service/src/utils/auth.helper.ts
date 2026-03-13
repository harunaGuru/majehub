import { ValidationError } from '../../../../packages/error-handler';
import redis from '../../../../packages/lib/redis';
import crypto from 'crypto';
import { sendMail } from './sendmail';
import { Request, Response, NextFunction } from 'express';
type UserType = 'user' | 'seller';
type Data = {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  country?: string;
};

export const ValidateData = (data: Data, type: UserType) => {
  const { name, email, password, phone_number, country } = data;
  console.log('validating data', data);
  if (
    !name ||
    !email ||
    !password ||
    (type === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError('Missing required fields');
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new ValidationError('Invalid email format');
  }
};

export const CheckOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    throw new ValidationError(
      'Account locked due to mutiple failed attempts. Please try again after 30 minutes.'
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    throw new ValidationError(
      'OTP requests are temporarily blocked due to suspicious activity. please wait 1hr before requesting another OTP.'
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    throw new ValidationError(
      'Please wait 1 minutes before requesting another OTP.'
    );
  }
};

export const TrackOtp = async (email: string, next: NextFunction) => {
  const attemptsKey = `otp_attempts:${email}`;
  let otpRequests = parseInt((await redis.get(attemptsKey)) || '0');
  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 60 * 60); // Lock for 1 hour
    throw new ValidationError(
      'Account locked due to multiple failed attempts. Please try again after 30 minutes.'
    );
  }
  otpRequests += 1;
  console.log('OTP Requests:', otpRequests);
  await redis.set(attemptsKey, otpRequests.toString(), 'EX', 30 * 60); // Track attempts for 30 minutes
};

export const SendOtp = async (
  email: string,
  name: string,
  template: string,
  next: NextFunction
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendMail(email, template, { name, otp }, 'Your OTP Code');
  await redis.set(`otp:${email}`, otp, 'EX', 5 * 60); // OTP valid for 5 minutes
  await redis.set(`otp_cooldown:${email}`, 'cooldown', 'EX', 60); // 1 minute cooldown
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError('OTP has expired. Please request a new one.');
  }
  const attemptsKey = `otp_attempts:${email}`;
  let failedAttempts = parseInt((await redis.get(attemptsKey)) || '0');
  if (storedOtp !== otp) {
    if (failedAttempts > 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 30 * 60); // Lock for 30 minutes
      await redis.del(`otp:${email}`, attemptsKey);
      throw next(new ValidationError(
        'Too many failed attempts. OTP locked for 30 minutes.'
      ));
    }
    // failedAttempts += 1;
    await redis.set(attemptsKey, failedAttempts + 1, 'EX', 300); // Track attempts for 5 minutes
    throw new ValidationError(
      `Invalid OTP, attempt remaining ${3 - failedAttempts}`
    );
  }
  await redis.del(`otp:${email}`, attemptsKey);
};

export const handleForgotPassword = async (
  email: string,
  next: NextFunction,
  name: string,
  userType: "user" | "seller",
) => {
  await CheckOtpRestriction(email, next);
  await TrackOtp(email, next);
  await SendOtp(email, name, userType === "user" ? 'password-reset-mail' : "password-reset-seller-mail", next);
};

export const handleVerifyForgotPasswordOtp = async ( req:Request, res:Response, next: NextFunction ) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return next(new ValidationError('Missing required fields'));
    }
    await verifyOtp(email, otp.toString(), next);
    res.status(200).send('OTP verified successfully.');
  } catch (error) {
    next(error);
  }
};