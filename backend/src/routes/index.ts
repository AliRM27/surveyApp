import { Router } from 'express';
import userRoutes from './user.routes';
import groupRoutes from './group.routes';
import surveyRoutes from './survey.routes';
import responseRoutes from './response.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/surveys', surveyRoutes);
router.use('/surveys', responseRoutes);
router.use('/auth', authRoutes);

export default router;
