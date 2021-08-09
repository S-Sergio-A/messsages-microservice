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
import { Server, Socket } from "socket.io";
import { MessageValidationPipe } from "../pipes/message.validation.pipe";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";
import { ExistingMessageDto } from "./dto/existing-message.dto";
import { SearchMessageDto } from "./dto/search-message.dto";
import { NewMessageDto } from "./dto/new-message.dto";
import { MessagesService } from "./messages.service";

@Injectable()
@WebSocketGateway({ path: "/socket.io/" })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(@Inject(forwardRef(() => MessagesService)) private readonly messagesService: MessagesService) {}

  @WebSocketServer()
  server: Server;

  private connectedUsers: { userId: string; roomId: string }[] = [];

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const queryParams = socket.handshake.query;

      const userId = queryParams.userId.toString();
      const roomId = queryParams.roomId.toString();

      this.connectedUsers.push({ userId, roomId });

      const usersConnectedToThisRoom = this.connectedUsers.filter((item) => item.roomId === queryParams.roomId);

      socket.join(roomId);

      this.server.emit("users", usersConnectedToThisRoom);
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const queryParams = socket.handshake.query;

      const userId = queryParams.userId.toString();
      const roomId = queryParams.roomId.toString();

      const userPosition = this.connectedUsers.findIndex((item) => item.userId === userId && item.roomId === roomId);

      if (userPosition > -1) {
        this.connectedUsers = [...this.connectedUsers.slice(0, userPosition), ...this.connectedUsers.slice(userPosition + 1)];
      }

      this.server.emit("users", this.connectedUsers);
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @UsePipes(new MessageValidationPipe())
  @SubscribeMessage("new-message")
  async createMessage(@MessageBody() data: NewMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const newMessage = await this.messagesService.addMessage(data, data.rights);
      this.server.to(data.roomId.toString()).emit("new-message", newMessage);
    } catch (e) {
      console.log(e, e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @UsePipes(new MessageValidationPipe())
  @SubscribeMessage("update-message")
  async updateMessage(@MessageBody() data: ExistingMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      this.server.to(data.roomId.toString()).emit("updated-message", await this.messagesService.updateMessage(data));
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @SubscribeMessage("delete-message")
  async deleteMessage(@MessageBody() data: ExistingMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      return await this.messagesService.deleteMessage(data.rights, data._id.toString(), data.roomId.toString(), data.user.toString());
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @SubscribeMessage("search-messages")
  async searchMessages(@MessageBody() data: SearchMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const searchedMessages = await this.messagesService.searchMessages(data.roomId, data.keyword);

      this.server.to(data.roomId.toString()).emit("searched-messages", searchedMessages);
    } catch (e) {
      console.log(e, e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @SubscribeMessage("load-more-messages")
  async loadMoreMessages(@MessageBody() data: string, @ConnectedSocket() socket: Socket): Promise<any> {
    try {
      const queryParams = socket.handshake.query;

      const roomId = queryParams.roomId.toString();

      const requestData: { start: number; end: number } = JSON.parse(data);

      const messages = await this.messagesService.getRoomMessagesLimited(roomId, requestData.start, requestData.end);

      this.server.emit("more-messages", messages);
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @SubscribeMessage("load-last-messages")
  async onRoomJoin(@ConnectedSocket() socket: Socket): Promise<any> {
    try {
      const queryParams = socket.handshake.query;

      const roomId = queryParams.roomId.toString();

      const messages = await this.messagesService.getRoomMessagesLimited(roomId, 0, 50);

      this.server.emit("last-messages", messages);
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }

  @SubscribeMessage("leave-room")
  async onRoomLeave(@MessageBody() data: { roomId: string; userId: string }, @ConnectedSocket() socket: Socket): Promise<void> {
    try {
      await this.messagesService.leaveRoom(data.roomId, data.userId);
      socket.leave(data.roomId);
    } catch (e) {
      console.log(e.stack);
      socket.send(
        "error",
        new WsException({
          key: "INTERNAL_ERROR",
          code: GlobalErrorCodes.INTERNAL_ERROR.code,
          message: GlobalErrorCodes.INTERNAL_ERROR.value
        })
      );
    }
  }
}
