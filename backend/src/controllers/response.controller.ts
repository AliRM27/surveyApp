import { Request, Response } from "express";
import { Types } from "mongoose";
import { ResponseModel } from "../models/response.model";
import { SurveyModel } from "../models/survey.model";
import { UserModel } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";

type SubmitResponseBody = {
  userId?: string;
  answers: { questionId: string; value: string | number | string[] }[];
};

export const submitResponse = asyncHandler(
  async (req: Request, res: Response) => {
    const surveyId = String(req.params.surveyId);
    const { userId, answers } = req.body as SubmitResponseBody;

    const survey = await SurveyModel.findById(surveyId).lean();
    if (!survey) {
      return res.status(404).json({ message: "Survey not found." });
    }

    if (!survey.anonymous && !userId) {
      return res
        .status(400)
        .json({ message: "userId is required for non-anonymous surveys." });
    }

    if (userId) {
      const userExists = await UserModel.exists({ _id: userId });
      if (!userExists) {
        return res.status(400).json({ message: "User does not exist." });
      }

      const hasSubmitted = survey.submittedBy?.some(
        (id: any) => id.toString() === userId,
      );
      if (hasSubmitted) {
        return res
          .status(409)
          .json({ message: "You have already submitted a response." });
      }
    }

    const questionMap = new Map(
      survey.questions.map((q) => [q._id.toString(), q]),
    );

    const sanitizedAnswers: {
      questionId: Types.ObjectId;
      value: string | number | string[];
    }[] = [];

    for (const ans of answers) {
      const questionId = String(ans.questionId);
      const question = questionMap.get(questionId);
      if (!question) {
        return res
          .status(400)
          .json({ message: "Invalid question id provided." });
      }

      if (question.type === "scale") {
        if (typeof ans.value !== "number") {
          return res
            .status(400)
            .json({
              message: `Question "${question.prompt}" expects a number.`,
            });
        }
        if (question.scale) {
          if (
            ans.value < question.scale.min ||
            ans.value > question.scale.max
          ) {
            return res.status(400).json({
              message: `Question "${question.prompt}" must be between ${question.scale.min} and ${question.scale.max}.`,
            });
          }
        }
      }

      if (question.type === "multiple_choice") {
        const values = Array.isArray(ans.value) ? ans.value : [ans.value];
        const invalid = values.some((v) => typeof v !== "string");
        if (invalid) {
          return res.status(400).json({
            message: `Question "${question.prompt}" expects text options.`,
          });
        }
      }

      if (question.type === "yes_no") {
        if (ans.value !== "Yes" && ans.value !== "No") {
          return res.status(400).json({
            message: `Question "${question.prompt}" expects 'Yes' or 'No'.`,
          });
        }
      }

      sanitizedAnswers.push({
        questionId: new Types.ObjectId(questionId),
        value: ans.value,
      });
    }

    const surveyObjectId = new Types.ObjectId(surveyId);
    const userObjectId = userId ? new Types.ObjectId(userId) : undefined;

    const responseDoc = await ResponseModel.create({
      survey: surveyObjectId,
      user: survey.anonymous ? undefined : userObjectId,
      answers: sanitizedAnswers,
    });

    if (userId && surveyObjectId) {
      await SurveyModel.findByIdAndUpdate(surveyObjectId, {
        $push: { submittedBy: new Types.ObjectId(userId) },
      });
    }

    res.status(201).json(responseDoc);
  },
);
