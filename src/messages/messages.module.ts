import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MessagesGateway } from "./messages.gateway";
import { MessagesController } from "./messages.controller";
import { MessageSchema } from "./schemas/message.schema";
import { MessagesService } from "./messages.service";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }])],
  controllers: [MessagesController],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesGateway, MessagesService]
})
export class MessageModule {}
