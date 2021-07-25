import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { UserDocument } from "./user.schema";
import { RoomDocument } from "./room.schema";

export type MessageDocument = Message & Document;

@Schema()
class Message {
  @Prop({ required: true, index: false, ref: "Room", type: Types.ObjectId })
  roomId: RoomDocument | Types.ObjectId;

  @Prop({ required: true, index: false, ref: "User", type: Types.ObjectId })
  user: UserDocument | Types.ObjectId;

  @Prop({ required: true, index: false })
  timestamp: string;

  @Prop({ required: true, index: false })
  text: string;

  @Prop({ required: false, index: false })
  attachment: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
