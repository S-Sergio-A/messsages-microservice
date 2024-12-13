import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RecentMessageDto } from "~/modules/rooms/dto/recent-message.dto";

export type RoomDocument = Room & Document;

@Schema()
class Room {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  photo: string;

  @Prop({ required: true })
  isUser: boolean;

  @Prop({ required: true })
  isPrivate: boolean;

  @Prop({ required: true, ref: "User", type: [Types.ObjectId] })
  usersID: Types.ObjectId[];

  @Prop({ required: true, ref: "Messages", type: [Types.ObjectId] })
  messagesID: Types.ObjectId[];

  @Prop({ required: false })
  recentMessage: RecentMessageDto;

  @Prop({ required: true })
  membersCount: number;

  @Prop({ required: true })
  createdAt: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
