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
import { Injectable } from "@nestjs/common";
import { GLOBAL_ERROR_CODES, GlobalErrorCodesEnum, LoggerService } from "@ssmovzh/chatterly-common-utils";
import { Server, Socket } from "socket.io";
import { ExistingMessageDto, SearchMessageDto } from "~/modules/messages/dto";
import { NewMessageDto } from "./dto/new-message.dto";
import { MessagesService } from "./messages.service";

@Injectable()
@WebSocketGateway({ path: "/socket.io/" })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private connectedUsers = new Map<string, string[]>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly logger: LoggerService
  ) {}

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const queryParams = socket.handshake.query;

      const userId = queryParams?.userId?.toString();
      const roomId = queryParams?.roomId?.toString();

      const usersInRoom = this.connectedUsers.get(roomId) || [];
      const usersConnectedToThisRoom = [...usersInRoom, userId];
      this.connectedUsers.set(roomId, usersConnectedToThisRoom);

      socket.join(roomId);

      this.server.emit("users", usersConnectedToThisRoom);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    try {
      const queryParams = socket.handshake.query;

      const userId = queryParams.userId.toString();
      const roomId = queryParams.roomId.toString();

      const usersInRoom = this.connectedUsers.get(roomId) || [];
      const usersConnectedToThisRoom = usersInRoom.filter((item) => item !== userId);
      this.connectedUsers.set(roomId, usersConnectedToThisRoom);

      this.server.emit("users", usersConnectedToThisRoom);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }

  @SubscribeMessage("new-message")
  async createMessage(@MessageBody() data: NewMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const newMessage = await this.messagesService.addMessage(data, data.rights);
      this.server.to(data.roomId.toString()).emit("new-message", newMessage);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }

  @SubscribeMessage("update-message")
  async updateMessage(@MessageBody() data: ExistingMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      this.server.to(data.roomId.toString()).emit("updated-message", await this.messagesService.updateMessage(data));
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }

  @SubscribeMessage("delete-message")
  async deleteMessage(@MessageBody() data: ExistingMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      return await this.messagesService.deleteMessage(data.rights, data._id.toString(), data.roomId.toString(), data.user.toString());
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }

  @SubscribeMessage("search-messages")
  async searchMessages(@MessageBody() data: SearchMessageDto, @ConnectedSocket() socket: Socket) {
    try {
      const searchedMessages = await this.messagesService.searchMessages(data.roomId, data.keyword);

      this.server.to(data.roomId.toString()).emit("searched-messages", searchedMessages);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
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
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
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
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }

  @SubscribeMessage("leave-room")
  async onRoomLeave(@MessageBody() data: { roomId: string; userId: string }, @ConnectedSocket() socket: Socket): Promise<any> {
    try {
      socket.leave(data.roomId);
      return await this.messagesService.leaveRoom(data.userId, data.roomId);
    } catch (error) {
      this.logger.error(error, error.trace);
      const { httpCode, msg } = GLOBAL_ERROR_CODES.get(GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR);

      socket.send(
        "error",
        new WsException({
          key: GlobalErrorCodesEnum.INTERNAL_SERVER_ERROR,
          code: httpCode,
          message: msg
        })
      );
    }
  }
}
