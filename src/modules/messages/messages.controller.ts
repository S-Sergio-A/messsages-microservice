// import { MessagePattern, Payload, RpcException, Transport } from "@nestjs/microservices";
import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
// import { MessageDocument } from "./schemas/message.schema";
// import { MessagesService } from "./messages.service";

@Controller()
export class MessagesController {
  // constructor(private readonly messagesService: MessagesService) {}

  // @MessagePattern({ cmd: "search-message" }, Transport.REDIS)
  // async searchMessage(@Payload() { roomId, keyword }: { roomId: string; keyword: string }): Promise<MessageDocument[] | RpcException> {
  //   return this.messagesService.searchMessages(roomId, keyword);
  // }
  //
  // @MessagePattern({ cmd: "invoke" }, Transport.REDIS)
  // async invoke(): Promise<void> {
  //   console.log("message-service invoked");
  // }
  
  @Get("/")
  @HttpCode(HttpStatus.OK)
  async invoke(): Promise<void> {
    console.log("message-service invoked");
  }
}
