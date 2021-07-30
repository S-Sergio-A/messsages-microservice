import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class SearchMessageDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  keyword: string;
}
