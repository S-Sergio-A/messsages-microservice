import { Body, Controller, Get, Post } from "@nestjs/common";
// import { MessagePattern } from "@nestjs/microservices";
// import { MessagesGateway } from "./messages.gateway";
// import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";

@Controller("messages")
export class MessagesController {
  // constructor(private readonly messagesGateway: MessagesGateway) {}

  // @Post()
  // @ApiOperation({ summary: "Send the entrance's message." })
  // @ApiCreatedResponse({})
  // @MessagePattern({ cmd: "send-message" })
  // async sendMessage(@Body() createUserDto: { message: "BOOBA" }) {
  //   this.messagesGateway.server.emit("send-message", "Hello from REST API");
  // }
  //
  // @Post()
  // @ApiOperation({ summary: "Delete the entrance's message depending on a message id." })
  // @ApiCreatedResponse({})
  // @MessagePattern({ cmd: "delete-message" })
  // async deleteMessage() {
  //   this.messagesGateway.server.emit("delete-message", "Hello from REST API");
  // }
  //
  // @Post()
  // @ApiOperation({ summary: "Send the entrance's message with an attachment." })
  // @ApiCreatedResponse({})
  // @MessagePattern({ cmd: "send-message-with-attachment" })
  // async sendMessageWithAttachment() {
  //   this.messagesGateway.server.emit("send-message-with-attachment", "Hello from REST API");
  // }

  @Get()
  async booba() {
    return { message: "Hello" };
  }
}
