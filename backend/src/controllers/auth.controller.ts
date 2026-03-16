import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { UserDocument, UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

const getClient = () => {
  if (!env.googleClientId) {
    throw new Error(
      'GOOGLE_CLIENT_ID is missing. Add it to your environment variables.'
    );
  }
  return new OAuth2Client(env.googleClientId);
};

const toSafeUser = (user: UserDocument) => {
  const plain = user.toObject ? user.toObject() : user;
  // Ensure password hash never leaves the server
  delete (plain as any).passwordHash;
  return plain;
};

const signUserToken = (user: UserDocument) =>
  jwt.sign({ userId: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: TOKEN_EXPIRY
  });

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: 'teacher' | 'student';
  };

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await UserModel.create({
    name,
    email,
    role,
    passwordHash
  });

  const token = signUserToken(user);
  return res.status(201).json({ token, user: toSafeUser(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  const user = await UserModel.findOne({ email }).select('+passwordHash');

  if (!user || !user.passwordHash) {
    return res
      .status(400)
      .json({ message: 'Account not found or password login unavailable.' });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signUserToken(user);
  return res.json({ token, user: toSafeUser(user) });
});

export const googleSignIn = asyncHandler(
  async (req: Request, res: Response) => {
    const { idToken, role } = req.body as {
      idToken?: string;
      role?: 'teacher' | 'student';
    };

    if (!idToken) {
      return res.status(400).json({ message: 'idToken is required.' });
    }

    const client = getClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleClientId
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res
        .status(400)
        .json({ message: 'Could not read email from Google token.' });
    }

    const desiredRole = role === 'teacher' ? 'teacher' : 'student';

    const user = await UserModel.findOneAndUpdate(
      { email: payload.email },
      {
        name: payload.name || payload.email.split('@')[0],
        role: desiredRole
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const token = signUserToken(user);

    res.json({
      token,
      user: toSafeUser(user),
      googleProfile: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      }
    });
  }
);
