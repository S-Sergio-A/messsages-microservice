import { IsDefined, IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";

export class MessageDto {
  @IsString()
  id: string;

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
  userId: Types.ObjectId;
}
