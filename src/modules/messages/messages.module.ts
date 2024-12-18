import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { MessageSchema, ModelsNamesEnum, RightsSchema, UserSchema } from "@ssmovzh/chatterly-common-utils";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";
import { MessagePublisherService } from "~/modules/messages/message-publisher.service";
import { RabbitModule } from "~/modules/rabbit";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelsNamesEnum.MESSAGES, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.USERS, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.RIGHTS, schema: RightsSchema }]),
    RabbitModule
  ],
  providers: [MessagesGateway, MessagesService, MessagePublisherService],
  exports: [MessagesGateway, MessagesService, MessagePublisherService]
})
export class MessageModule {}
