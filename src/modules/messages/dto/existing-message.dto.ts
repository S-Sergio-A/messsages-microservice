import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";
import sanitizeHtml from "sanitize-html";
import { Types } from "mongoose";
import { UserDocument } from "~/modules/schemas";
import { RightsEnum } from "~/modules/common";

export class ExistingMessageDto {
  @IsNotEmpty()
  @IsString()
  _id: string | Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  roomId: string | Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => sanitizeHtml(value.trim()))
  text: string;

  @IsString()
  attachment?: any[];

  @IsNotEmpty()
  user: UserDocument;

  @IsArray()
  @IsEnum(RightsEnum, { each: true })
  rights: RightsEnum[];
}
