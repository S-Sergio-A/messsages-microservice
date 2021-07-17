import { ClientProxy, ClientProxyFactory, RpcException, Transport } from "@nestjs/microservices";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Observable } from "rxjs";
import { Model } from "mongoose";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";
import { InternalException } from "../exceptions/Internal.exception";
import { MessageDocument } from "./schemas/message.schema";
import { UserDocument } from "./schemas/user.schema";
import { MessageDto } from "./message.dto";
import { timestamp } from "rxjs/operators";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel("Message") private readonly messageModel: Model<MessageDocument>,
    @InjectModel("User") private readonly userModel: Model<UserDocument>
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: `redis://${process.env.REDIS_DB_NAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`,
        retryDelay: 3000,
        retryAttempts: 10
      }
    });
  }

  client: ClientProxy;

  async addMessage(messageDto: MessageDto, rights: string[]): Promise<Observable<any>> {
    try {
      const createdMessage = new this.messageModel(messageDto);
      await createdMessage.save();
      return await this._addMessageReferenceToRoom(rights, messageDto.id, messageDto.roomId);
    } catch (e) {
      console.log(e, e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async updateMessage(messageDto: MessageDto, rights: string[]): Promise<HttpStatus | Error> {
    try {
      // if (!rights.includes("UPDATE_MESSAGE")){
      //
      // }
      const message = await this.messageModel.findOne({ id: messageDto.id });

      // if (message.user !== messageDto.userId) {
      //   return HttpStatus.FORBIDDEN;
      // }

      const updatedMessage = {
        _id: message._id,
        id: message.id,
        roomId: message.roomId,
        user: message.user,
        text: messageDto.text ? messageDto.text : message.text,
        attachment: messageDto.attachment ? messageDto.attachment : message.attachment,
        timestamp: message.timestamp
      };
      await this.messageModel.updateOne({ id: messageDto.id }, updatedMessage);
      return HttpStatus.CREATED;
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async searchMessages(roomId: string, keyword: string): Promise<MessageDocument[] | RpcException> {
    try {
      const regex = new RegExp(keyword, "i");

      return this.messageModel.find({ roomId, text: regex });
    } catch (e) {
      console.log(e.stack);
      return new RpcException(e);
    }
  }

  async deleteMessage(rights, messageId, roomId, userId): Promise<HttpStatus | Observable<any>> {
    try {
      if (rights.includes("DELETE_MESSAGES")) {
      }

      const { deletedCount } = await this.messageModel.deleteOne({ id: messageId });

      if (deletedCount !== 0) {
        return await this._deleteMessageReferenceFromRoom(rights, messageId, roomId);
      }

      return HttpStatus.BAD_REQUEST;
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async getRoomMessagesLimited(roomId: string, start: number = 0, end: number = 50): Promise<MessageDocument[]> {
    try {
      const messagess = await this.messageModel
        .find({ roomId });
      
      const messages = await this.messageModel
        .find({ roomId })
        .sort({ timestamp: -1 })
        .skip(start)
        .limit(end)
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);

      console.log(messagess, messages);

      return messages;
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  private async _addMessageReferenceToRoom(rights: string[], messageId: string, roomId: string): Promise<Observable<any>> {
    try {
      return this.client.send(
        { cmd: "add-message-reference" },
        {
          rights,
          roomId,
          messageId
        }
      );
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  private async _deleteMessageReferenceFromRoom(rights: string[], messageId: string, roomId: string): Promise<Observable<any>> {
    try {
      return this.client.send(
        { cmd: "delete-message-reference" },
        {
          rights,
          roomId,
          messageId
        }
      );
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }
}
