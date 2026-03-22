import { Schema, model, Document, Types } from 'mongoose';
import { UserDocument } from './user.model';
import { GroupDocument } from './group.model';

export type QuestionType = 'multiple_choice' | 'scale' | 'text' | 'yes_no';

export interface Question {
  _id: Types.ObjectId;
  prompt: string;
  type: QuestionType;
  options?: string[];
  scale?: {
    min: number;
    max: number;
    step?: number;
  };
}

export interface SurveyDocument extends Document {
  title: string;
  group: Types.ObjectId | GroupDocument;
  createdBy: Types.ObjectId | UserDocument;
  anonymous: boolean;
  questions: Question[];
  submittedBy?: Types.ObjectId[] | UserDocument[];
  createdAt: Date;
}

const questionSchema = new Schema<Question>(
  {
    prompt: { type: String, required: true },
    type: {
      type: String,
      enum: ['multiple_choice', 'scale', 'text', 'yes_no'],
      required: true
    },
    options: [{ type: String }],
    scale: {
      min: Number,
      max: Number,
      step: { type: Number, default: 1 }
    }
  },
  { _id: true }
);

const surveySchema = new Schema<SurveyDocument>(
  {
    title: { type: String, required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    anonymous: { type: Boolean, default: false },
    questions: { type: [questionSchema], required: true },
    submittedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const SurveyModel = model<SurveyDocument>('Survey', surveySchema);
