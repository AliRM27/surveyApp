export type UserRole = 'teacher' | 'student';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Group = {
  _id: string;
  name: string;
  teacher: User;
  members: User[];
};

export type QuestionType = 'multiple_choice' | 'scale' | 'text';

export type Question = {
  _id: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  scale?: { min: number; max: number; step?: number };
};

export type Survey = {
  _id: string;
  title: string;
  group: string;
  createdBy: string;
  anonymous: boolean;
  questions: Question[];
  createdAt: string;
};

export type SurveyResult = {
  surveyId: string;
  totalResponses: number;
  questions: {
    questionId: string;
    prompt: string;
    type: QuestionType;
    summary:
      | { counts: Record<string, number> }
      | { average: number | null; min: number | null; max: number | null }
      | { responses: string[] };
  }[];
};
