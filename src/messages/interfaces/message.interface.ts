import { Document } from "mongoose";

export interface Message extends Document {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  attachment?: string;
  timestamp: string;
}
