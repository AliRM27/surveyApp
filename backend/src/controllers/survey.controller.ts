import { Request, Response } from 'express';
import { GroupModel } from '../models/group.model';
import { SurveyModel } from '../models/survey.model';
import { ResponseModel } from '../models/response.model';
import { UserModel } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';

export const createSurvey = asyncHandler(async (req: Request, res: Response) => {
  const { title, groupId, createdBy, anonymous = false, questions } = req.body;

  const [group, creator] = await Promise.all([
    GroupModel.findById(groupId),
    UserModel.findById(createdBy)
  ]);

  if (!group) {
    return res.status(400).json({ message: 'Group not found.' });
  }

  if (!creator || creator.role !== 'teacher') {
    return res
      .status(400)
      .json({ message: 'Creator must be an existing teacher.' });
  }

  const survey = await SurveyModel.create({
    title,
    group: groupId,
    createdBy,
    anonymous,
    questions
  });

  res.status(201).json(survey);
});

export const getSurvey = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const survey = await SurveyModel.findById(id)
    .populate('group', 'name')
    .populate('createdBy', 'name email role')
    .lean();

  if (!survey) {
    return res.status(404).json({ message: 'Survey not found.' });
  }

  res.json(survey);
});

export const listSurveysByGroup = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId } = req.params;
    const surveys = await SurveyModel.find({ group: groupId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(surveys);
  }
);

export const getSurveyResults = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const survey = await SurveyModel.findById(id).lean();

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found.' });
    }

    const responses = await ResponseModel.find({ survey: id }).lean();
    const totalResponses = responses.length;

    const questionSummaries = survey.questions.map((question) => {
      const answersForQuestion = responses
        .flatMap((resp) => resp.answers)
        .filter((ans) => ans.questionId.toString() === question._id.toString());

      if (question.type === 'multiple_choice' || question.type === 'yes_no') {
        const counts: Record<string, number> = {};
        answersForQuestion.forEach((ans) => {
          const values = Array.isArray(ans.value) ? ans.value : [ans.value];
          values.forEach((v) => {
            if (typeof v === 'string') {
              counts[v] = (counts[v] || 0) + 1;
            }
          });
        });
        return { questionId: question._id, prompt: question.prompt, type: question.type, summary: { counts } };
      }

      if (question.type === 'scale') {
        const numeric = answersForQuestion
          .map((ans) => Number(ans.value))
          .filter((v) => !Number.isNaN(v));

        const average =
          numeric.length > 0
            ? numeric.reduce((sum, n) => sum + n, 0) / numeric.length
            : null;

        return {
          questionId: question._id,
          prompt: question.prompt,
          type: question.type,
          summary: {
            average,
            min: numeric.length ? Math.min(...numeric) : null,
            max: numeric.length ? Math.max(...numeric) : null
          }
        };
      }

      // text question
      const textAnswers = answersForQuestion
        .map((ans) => ans.value)
        .filter((v): v is string => typeof v === 'string');

      return {
        questionId: question._id,
        prompt: question.prompt,
        type: question.type,
        summary: { responses: textAnswers }
      };
    });

    res.json({
      surveyId: id,
      totalResponses,
      questions: questionSummaries
    });
  }
);
