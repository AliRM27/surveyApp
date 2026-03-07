import { Router } from 'express';
import { z } from 'zod';
import {
  createSurvey,
  getSurvey,
  getSurveyResults,
  listSurveysByGroup
} from '../controllers/survey.controller';
import { validateRequest } from '../middlewares/validateRequest';

const router = Router();

const baseQuestion = z.object({
  prompt: z.string().min(1),
  type: z.enum(['multiple_choice', 'scale', 'text'])
});

const multipleChoiceQuestion = baseQuestion.extend({
  type: z.literal('multiple_choice'),
  options: z.array(z.string()).min(1, 'Provide at least one option')
});

const scaleQuestion = baseQuestion
  .extend({
    type: z.literal('scale'),
    scale: z.object({
      min: z.number(),
      max: z.number(),
      step: z.number().positive().optional()
    })
  })
  .refine((data) => data.scale.min < data.scale.max, {
    message: 'Scale min must be less than max'
  });

const textQuestion = baseQuestion.extend({
  type: z.literal('text')
});

const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestion,
  scaleQuestion,
  textQuestion
]);

const createSurveySchema = z.object({
  title: z.string().min(1),
  groupId: z.string().min(1),
  createdBy: z.string().min(1),
  anonymous: z.boolean().optional(),
  questions: z.array(questionSchema).min(1)
});

const idParamSchema = z.object({ id: z.string().min(1) });
const groupParamSchema = z.object({ groupId: z.string().min(1) });

router.post('/', validateRequest(createSurveySchema), createSurvey);
router.get(
  '/group/:groupId',
  validateRequest(groupParamSchema, 'params'),
  listSurveysByGroup
);
router.get('/:id', validateRequest(idParamSchema, 'params'), getSurvey);
router.get(
  '/:id/results',
  validateRequest(idParamSchema, 'params'),
  getSurveyResults
);

export default router;
