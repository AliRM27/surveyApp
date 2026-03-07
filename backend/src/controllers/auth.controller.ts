import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

const getClient = () => {
  if (!env.googleClientId) {
    throw new Error(
      'GOOGLE_CLIENT_ID is missing. Add it to your environment variables.'
    );
  }
  return new OAuth2Client(env.googleClientId);
};

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

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      env.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user,
      googleProfile: {
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      }
    });
  }
);
