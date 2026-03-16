import { Router } from 'express';
import { z } from 'zod';
import { googleSignIn, login, register } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['teacher', 'student'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required'),
  role: z.enum(['teacher', 'student']).optional()
});

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/google', validateRequest(googleAuthSchema), googleSignIn);

export default router;
