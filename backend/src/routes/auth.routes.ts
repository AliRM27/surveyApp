import { Router } from 'express';
import { z } from 'zod';
import { googleSignIn } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required'),
  role: z.enum(['teacher', 'student']).optional()
});

router.post('/google', validateRequest(googleAuthSchema), googleSignIn);

export default router;
