import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from "@nestjs/websockets";
import { forwardRef, Inject, Injectable, UsePipes } from "@nestjs/common";
import { Observable } from "rxjs";
import { Socket } from "net";
import { MessageValidationPipe } from "../pipes/validation/message.validation.pipe";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";
import { MessagesService } from "./messages.service";
import { MessageDto } from "./message.dto";

@Injectable()
@WebSocketGateway({ namespace: "socket.io" })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(@Inject(forwardRef(() => MessagesService)) private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  server;

  private connectedUsers: { userId: string; roomId: string }[] = [];

  async handleConnection(socket, message) {
    try {
      const queryParams = message.url.split("=");
      const userId = queryParams[1];
      const roomId = queryParams[3];

      this.connectedUsers.push({ userId, roomId });

      socket.send("users", this.connectedUsers);
      this.server.emit("users", this.connectedUsers);
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async handleDisconnect(socket) {
    try {
      const userId = socket.url.split("=")[1];
      const userPosition = this.connectedUsers.findIndex((item, index) => item.userId === userId);

      if (userPosition > -1) {
        this.connectedUsers = [...this.connectedUsers.slice(0, userPosition), ...this.connectedUsers.slice(userPosition + 1)];
      }

      socket.send("users", this.connectedUsers);
      this.server.emit("users", this.connectedUsers);
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @SubscribeMessage("")
  async all(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    try {
      console.log(data);
      const messageData: MessageDto & { rights: string[] } = JSON.parse(data);

      await this.messagesService.addMessage(messageData);
      client.emit("receive-message", messageData.text);
      return new Observable((observer) => observer.next({ event: "receive-message", data: messageData.text }));
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @UsePipes(new MessageValidationPipe())
  @SubscribeMessage("message")
  async onMessageCreation(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    try {
      console.log(data);
      const messageData: MessageDto & { rights: string[] } = JSON.parse(data);

      await this.messagesService.addMessage(messageData);
      client.emit("receive-message", messageData.text);
      return new Observable((observer) => observer.next({ event: "receive-message", data: messageData.text }));
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @UsePipes(new MessageValidationPipe())
  @SubscribeMessage("update-message")
  async onMessageUpdate(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    try {
      console.log(data);
      const messageData: MessageDto = JSON.parse(data);

      await this.messagesService.updateMessage(messageData);
      client.emit("update-message", messageData.text);
      return new Observable((observer) => observer.next({ event: "update-message", data: messageData.text }));
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @SubscribeMessage("delete-message")
  async onDelete(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
    try {
      console.log(data);
      const messageData: MessageDto & { rights: string[] } = JSON.parse(data);

      await this.messagesService.deleteMessage(messageData.rights, messageData.id, messageData.roomId);
      client.emit("delete-message", messageData.text);
      return new Observable((observer) => observer.next({ event: "delete-message", data: messageData.text }));
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @SubscribeMessage("load-more-messages")
  async loadMoreMessages(@MessageBody() data: string, @ConnectedSocket() client: Socket): Promise<any> {
    try {
      console.log(data);
      const requestData: { roomId: string; start: number; end: number } = JSON.parse(data);

      const messages = await this.messagesService.getRoomMessagesLimited(requestData.roomId, requestData.start, requestData.end);

      client.emit("message", messages);
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @SubscribeMessage("join-room")
  async onRoomJoin(@MessageBody() data: string, @ConnectedSocket() client: Socket): Promise<any> {
    try {
      console.log(data);
      const requestData: { roomId: string } = JSON.parse(data);

      const messages = await this.messagesService.getRoomMessagesLimited(requestData.roomId, 0, 50);

      client.emit("message", messages);
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  @SubscribeMessage("leave-room")
  onRoomLeave(client, data: any): void {
    try {
      client.leave(data[0]);
    } catch (e) {
      console.log(e.stack);
      throw new WsException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }
}
