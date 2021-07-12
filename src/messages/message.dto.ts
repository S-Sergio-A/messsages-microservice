import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class MessageDto {
  @IsDefined()
  @IsNotEmpty()
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
  
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  attachment?: string;
  
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
