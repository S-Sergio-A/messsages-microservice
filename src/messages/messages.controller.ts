import { MessagePattern, Payload, RpcException, Transport } from "@nestjs/microservices";
import { Controller } from "@nestjs/common";
import { MessageDocument } from "./message.schema";
import { MessagesService } from "./messages.service";

@Controller("messages")
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @MessagePattern({ cmd: "search-message" }, Transport.REDIS)
  async sendMessage(@Payload() keyword: string): Promise<MessageDocument[] | RpcException> {
    return this.messagesService.searchMessages(keyword);
  }
}
