import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { UserDocument } from "./user.schema";
import { RoomDocument } from "./room.schema";

export type MessageDocument = Message & Document;

@Schema()
class Message {
  @Prop({ required: true, ref: "Room", type: Types.ObjectId })
  roomId: RoomDocument | Types.ObjectId;

  @Prop({ required: true, ref: "User", type: Types.ObjectId })
  user: UserDocument | Types.ObjectId;

  @Prop({ required: true })
  timestamp: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: false })
  attachment: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
