import { Schema, model, Document } from 'mongoose';

export type UserRole = 'teacher' | 'student';

export interface UserDocument extends Document {
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      required: true
    },
    passwordHash: { type: String, select: false }
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
