import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { RoomDocument } from "./room.schema";
import { UserDocument } from "./user.schema";

export type RightsDocument = Rights & Document;

@Schema()
class Rights {
  @Prop({ required: true, ref: "User", type: Types.ObjectId })
  user: UserDocument | Types.ObjectId;

  @Prop({ required: true, ref: "Room", type: Types.ObjectId })
  roomId: RoomDocument | Types.ObjectId;

  @Prop({ required: true })
  rights: string[];
}

export const RightsSchema = SchemaFactory.createForClass(Rights);
