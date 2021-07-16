import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessageSchema } from "./schemas/message.schema";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";
import { UserSchema } from "./schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }], "messages"),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }], "users")
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesGateway, MessagesService]
})
export class MessageModule {}
