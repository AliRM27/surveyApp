import { Schema, model, Document, Types } from 'mongoose';
import { SurveyDocument } from './survey.model';
import { UserDocument } from './user.model';

export interface Answer {
  questionId: Types.ObjectId;
  value: string | number | string[];
}

export interface ResponseDocument extends Document {
  survey: Types.ObjectId | SurveyDocument;
  user?: Types.ObjectId | UserDocument;
  answers: Answer[];
  createdAt: Date;
}

const answerSchema = new Schema<Answer>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    value: { type: Schema.Types.Mixed, required: true }
  },
  { _id: false }
);

const responseSchema = new Schema<ResponseDocument>(
  {
    survey: { type: Schema.Types.ObjectId, ref: 'Survey', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    answers: { type: [answerSchema], required: true }
  },
  { timestamps: true }
);

export const ResponseModel = model<ResponseDocument>(
  'Response',
  responseSchema
);
