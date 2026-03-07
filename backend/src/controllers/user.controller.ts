import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role } = req.body;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered.' });
  }

  const user = await UserModel.create({ name, email, role });
  res.status(201).json(user);
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserModel.find().lean();
  res.json(users);
});
