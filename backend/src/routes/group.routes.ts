import { Router } from 'express';
import { z } from 'zod';
import {
  addMember,
  createGroup,
  getGroup,
  listGroups
} from '../controllers/group.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  teacherId: z.string().min(1),
  memberIds: z.array(z.string()).optional()
});

const idParamSchema = z.object({ id: z.string().min(1) });
const addMemberSchema = z.object({ memberId: z.string().min(1) });

router.post('/', validateRequest(createGroupSchema), createGroup);
router.get('/', listGroups);
router.get('/:id', validateRequest(idParamSchema, 'params'), getGroup);
router.post(
  '/:id/members',
  validateRequest(idParamSchema, 'params'),
  validateRequest(addMemberSchema),
  addMember
);

export default router;
