import { User } from "./user";

export interface Group {
  _id: string;
  name: string;
  teacher: User | string;
  members: User[] | string[];
  groupCode: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}
