import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RightsDocument = Rights & Document;

@Schema()
class Rights {
  @Prop({ required: true, index: false, ref: "User", type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ required: true, index: false, ref: "Room" })
  roomId: string;

  @Prop({ required: true, index: false })
  rights: string[];
}

export const RightsSchema = SchemaFactory.createForClass(Rights);
