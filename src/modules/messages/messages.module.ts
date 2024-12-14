import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { ConnectionNamesEnum, ModelsNamesEnum, Right, Message, User } from "@ssmovzh/chatterly-common-utils";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";
import { MessagePublisherService } from "~/modules/messages/message-publisher.service";
import { RabbitModule } from "~/modules/rabbit";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelsNamesEnum.MESSAGES, schema: Message }], ConnectionNamesEnum.MESSAGES),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.USERS, schema: User }], ConnectionNamesEnum.USERS),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.RIGHTS, schema: Right }], ConnectionNamesEnum.ROOMS),
    RabbitModule
  ],
  providers: [MessagesGateway, MessagesService, MessagePublisherService],
  exports: [MessagesGateway, MessagesService, MessagePublisherService]
})
export class MessageModule {}
