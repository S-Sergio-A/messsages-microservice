import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { UserDocument } from "./user.schema";

export type MessageDocument = Message & Document;

@Schema()
class Message {
  @Prop({ required: true, index: true })
  id: string;

  @Prop({ required: true, index: false, ref: "Room" })
  roomId: string;

  @Prop({ required: true, index: false, ref: "User", type: [Types.ObjectId] })
  user: UserDocument;

  @Prop({ required: true, index: false })
  timestamp: string;

  @Prop({ required: true, index: false })
  text: string;

  @Prop({ required: false, index: false })
  attachment: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
