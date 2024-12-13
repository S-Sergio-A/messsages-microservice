import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { MessagesController } from "./messages.controller";
import { MessageSchema } from "./schemas/message.schema";
import { MessagesGateway } from "./messages.gateway";
import { MessagesService } from "./messages.service";
import { UserSchema } from "./schemas/user.schema";
import { RightsSchema } from "./schemas/rights.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Message", schema: MessageSchema }], "message"),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }], "user"),
    MongooseModule.forFeature([{ name: "Rights", schema: RightsSchema }], "room")
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesGateway, MessagesService]
})
export class MessageModule {}
