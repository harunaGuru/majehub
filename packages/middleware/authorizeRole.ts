import { NextFunction, Response } from 'express';

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (!req.seller) {
    res.status(401).send('Not authorized');
    return;
  }
  next();
};
export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).send('Not authorized');
    return;
  }
  next();
};

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.admin) {
    res.status(401).send('Not authorized');
    return;
  }
  next();
};
