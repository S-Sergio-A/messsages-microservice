import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { forwardRef, Inject, Injectable, UsePipes } from "@nestjs/common";
import { Observable } from "rxjs";
import { MessagesService } from "./messages.service";
import { MessageValidationPipe } from "../pipes/validation/message.validation.pipe";

@Injectable()
@WebSocketGateway(1080)
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(@Inject(forwardRef(() => MessagesService)) private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  server;

  private connectedUsers: { userId: string; roomId: string }[] = [];

  async handleConnection(socket, message) {
    const queryParams = message.url.split("=");
    const userId = queryParams[1];
    const roomId = queryParams[3];

    this.connectedUsers = [...this.connectedUsers, { userId, roomId }];

    socket.send("users", this.connectedUsers);
    this.server.emit("users", this.connectedUsers);
  }

  async handleDisconnect(socket) {
    const userId = socket.url.split("=")[1];
    const userPosition = this.connectedUsers.findIndex((item, index) => item.userId === userId);

    if (userPosition > -1) {
      this.connectedUsers = [...this.connectedUsers.slice(0, userPosition), ...this.connectedUsers.slice(userPosition + 1)];
    }

    this.server.emit("users", this.connectedUsers);
  }

  @UsePipes(new MessageValidationPipe())
  // @SubscribeMessage("message")
  async onMessageCreation(client, data: any) {
    console.log(data);
    const event = "message";
    const result = data[0];

    await this.messagesService.addMessage(result);
    client.broadcast.to(result.room).emit(event, result.message);

    return new Observable((observer) => observer.next({ event: "create-message", data: result.message }));
  }

  @UsePipes(new MessageValidationPipe())
  @SubscribeMessage("update-message")
  async onMessageUpdate(client, data: any) {
    console.log(data);
    const result = data[0];

    await this.messagesService.updateMessage(result);
    client.broadcast.to(result.room).emit("update-message", result.message);

    return new Observable((observer) => observer.next({ event: "update-message", data: result.message }));
  }

  //{ messageId: string, roomId: string }
  @SubscribeMessage("delete-message")
  async onDelete(client, data: any) {
    console.log(data);
    const result = data[0];

    await this.messagesService.deleteMessage(result.message, result.room);
    client.broadcast.to(result.room).emit("delete-message", result.message);

    return new Observable((observer) => observer.next({ event: "delete-message", data: result.message }));
  }

  //{ roomId: string; start: number; end: number }
  @SubscribeMessage("load-more-messages")
  async loadMoreMessages(client, data: any): Promise<any> {
    const result = data[0];

    const messages = await this.messagesService.getRoomMessagesLimited(result.roomId, result.start, result.end);

    client.emit("message", messages);
  }

  @SubscribeMessage("join-room")
  async onRoomJoin(client, data: any): Promise<any> {
    client.join(data[0]);

    const messages = await this.messagesService.getRoomMessagesLimited(data[0].roomId, 0, 50);

    client.emit("message", messages);
  }

  @SubscribeMessage("leave-room")
  onRoomLeave(client, data: any): void {
    client.leave(data[0]);
  }
}
