import { IsDefined, IsNotEmpty, IsString, IsUUID, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MessageDto {
  @ApiProperty({
    example: "13f4fwe4",
    description: "ID of the message.",
    format: "string"
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    example: "af5d7dd9",
    description: "ID of the messages where the message was sent.",
    format: "string"
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @ApiProperty({
    example: "13:15 06.07.2021",
    description: "The timestamp of the message.",
    format: "string"
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  timestamp: string;

  @ApiProperty({
    example: "Я продаю лучшие хергитские гобелены. Не желаете взглянуть?",
    description: "The entrance's message.",
    format: "string"
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    example: "A photo in base64.",
    description: "Optional attachment.",
    format: "string"
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  attachment?: string;

  @ApiProperty({
    example: "13f4fpp9",
    description: "ID of the entrance.",
    format: "string"
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
