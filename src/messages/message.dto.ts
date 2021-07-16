import { IsDefined, IsNotEmpty, IsString } from "class-validator";

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
  userId: string;
  
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username: string;
}
