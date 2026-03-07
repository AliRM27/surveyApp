import { Schema, model, Document, Types } from 'mongoose';
import { UserDocument } from './user.model';

export interface GroupDocument extends Document {
  name: string;
  teacher: Types.ObjectId | UserDocument;
  members: Types.ObjectId[];
}

const groupSchema = new Schema<GroupDocument>(
  {
    name: { type: String, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const GroupModel = model<GroupDocument>('Group', groupSchema);
