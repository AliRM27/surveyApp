import { Router } from 'express';
import { z } from 'zod';
import { createUser, listUsers } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  role: z.enum(['teacher', 'student'])
});

router.post('/', validateRequest(createUserSchema), createUser);
router.get('/', listUsers);

export default router;
