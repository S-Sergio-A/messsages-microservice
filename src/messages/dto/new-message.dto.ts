import { IsArray, IsDefined, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class NewMessageDto {
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
  attachment?: any[];

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  user: string | Types.ObjectId;

  @IsDefined()
  @IsNotEmpty()
  @IsArray()
  rights: string[];
}
