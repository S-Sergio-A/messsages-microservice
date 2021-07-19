import { IsArray, IsDefined, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class MessageDto {
  @IsString()
  _id: Types.ObjectId;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  roomId: string;

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
  @IsString()
  user: Types.ObjectId;
  
  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  rights: string[];
}
