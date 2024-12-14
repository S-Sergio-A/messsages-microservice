import { IsNotEmpty, IsString } from "class-validator";

export class SearchMessageDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  keyword: string;
}
