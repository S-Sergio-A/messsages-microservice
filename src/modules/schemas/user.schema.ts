import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema()
class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: false })
  photo: string;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ required: false })
  birthday: string;

  @Prop({ required: false })
  verification: string;

  @Prop({ required: false })
  isActive: boolean;

  @Prop({ required: false })
  isBlocked: boolean;

  @Prop({ required: false })
  verificationExpires: number;

  @Prop({ required: false })
  loginAttempts: number;

  @Prop({ required: false })
  blockExpires: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
