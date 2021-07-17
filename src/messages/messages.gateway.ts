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
import { MessageValidationPipe } from "../pipes/validation/message.validation.pipe";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";
import { MessagesService } from "./messages.service";
import { MessageDto } from "./message.dto";

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

      // socket.send("users", usersConnectedToThisRoom);
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

      const userPosition = this.connectedUsers.findIndex((item, index) => item.userId === userId && item.roomId === roomId);

      if (userPosition > -1) {
        this.connectedUsers = [...this.connectedUsers.slice(0, userPosition), ...this.connectedUsers.slice(userPosition + 1)];
      }

      // socket.send("users", this.connectedUsers);
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
  async onMessageCreation(@MessageBody() data: MessageDto, @ConnectedSocket() socket: Socket) {
    try {
      // let rights = JSON.parse(<string>socket.handshake.headers["rights"]);
      //
      // if (typeof rights === "string") {
      //   rights = [...rights];
      // }

      return await this.messagesService.addMessage(data, ["SEND_MESSAGES"]);
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

  /* Not working
   */
  @UsePipes(new MessageValidationPipe())
  @SubscribeMessage("update-message")
  async onMessageUpdate(@MessageBody() data: MessageDto, @ConnectedSocket() socket: Socket) {
    try {
      let rights = JSON.parse(<string>socket.handshake.headers["rights"]);

      if (typeof rights === "string") {
        rights = [...rights];
      }

      return await this.messagesService.updateMessage(data, rights);
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

  /* Not working
   */
  @SubscribeMessage("delete-message")
  async onDelete(@MessageBody() data: string, @ConnectedSocket() socket: Socket) {
    try {
      const queryParams = socket.handshake.query;

      const userId = queryParams.userId.toString();
      const roomId = queryParams.roomId.toString();
      let rights = JSON.parse(<string>socket.handshake.headers["rights"]);

      const messageData: { id: string } = JSON.parse(data);

      return await this.messagesService.deleteMessage(rights, messageData.id, roomId, userId);
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
  
      console.log(roomId);

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

  /* Not working
   */
  @SubscribeMessage("leave-room")
  onRoomLeave(@ConnectedSocket() socket: Socket): void {
    try {
      const queryParams = socket.handshake.query;

      const userId = queryParams.userId.toString();
      const roomId = queryParams.roomId.toString();

      socket.leave(roomId);
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
