import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessageSchema } from "./message.schema";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";

@Module({
  imports: [MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }])],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesGateway, MessagesService]
})
export class MessageModule {}
