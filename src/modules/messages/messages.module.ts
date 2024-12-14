import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";
import {
  ConnectionNamesEnum,
  MessageSchema,
  ModelsNamesEnum,
  RightsSchema,
  UserSchema
} from "@ssmovzh/chatterly-common-utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ModelsNamesEnum.MESSAGES, schema: MessageSchema }], ConnectionNamesEnum.MESSAGES),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.USERS, schema: UserSchema }], ConnectionNamesEnum.USERS),
    MongooseModule.forFeature([{ name: ModelsNamesEnum.RIGHTS, schema: RightsSchema }], ConnectionNamesEnum.ROOMS)
  ],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesGateway, MessagesService]
})
export class MessageModule {}
