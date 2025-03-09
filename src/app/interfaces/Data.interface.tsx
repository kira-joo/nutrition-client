import { ObjectId } from "mongodb";

export interface Data {
  _id: ObjectId;
  from: string;
  to: string;
  text: string;
  phone?: string;
  read?: boolean;
}
