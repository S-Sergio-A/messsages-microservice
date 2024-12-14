import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import sanitizeHtml from "sanitize-html";
import { Types } from "mongoose";
import { RightsEnum } from "@ssmovzh/chatterly-common-utils";

export class NewMessageDto {
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

  @IsString({ each: true })
  @IsOptional()
  attachment?: any[];

  @IsNotEmpty()
  @IsString()
  user: string | Types.ObjectId;

  @IsOptional()
  @IsString()
  username?: string;

  @IsArray()
  @IsEnum(RightsEnum, { each: true })
  rights: RightsEnum[];
}
