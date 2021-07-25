import { IsArray, IsDefined, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";
import { UserDocument } from "../schemas/user.schema";

export class ExistingMessageDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  _id: string | Types.ObjectId;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  roomId: string | Types.ObjectId;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsString()
  attachment?: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNotEmpty()
  user: UserDocument;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  rights: string[];
}
