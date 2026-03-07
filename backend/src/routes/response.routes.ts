import { Router } from 'express';
import { z } from 'zod';
import { submitResponse } from '../controllers/response.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const surveyParamSchema = z.object({ surveyId: z.string().min(1) });

const responseSchema = z.object({
  userId: z.string().optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        value: z.union([z.string(), z.number(), z.array(z.string())])
      })
    )
    .min(1, 'Provide at least one answer')
});

router.post(
  '/:surveyId/responses',
  validateRequest(surveyParamSchema, 'params'),
  validateRequest(responseSchema),
  submitResponse
);

export default router;
