import { ClientProxy, ClientProxyFactory, RpcException, Transport } from "@nestjs/microservices";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Observable } from "rxjs";
import { Model } from "mongoose";
import { InternalException } from "../exceptions/Internal.exception";
import { MessageDocument } from "./message.schema";
import { MessageDto } from "./message.dto";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";

@Injectable()
export class MessagesService {
  constructor(@InjectModel("Message") private readonly messageModel: Model<MessageDocument>) {
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

  async addMessage(messageDto: MessageDto & { rights: string[] }): Promise<Observable<any>> {
    try {
      const createdMessage = new this.messageModel(messageDto);
      await createdMessage.save();
      return await this._addMessageReferenceToRoom(messageDto.rights, messageDto.id, messageDto.roomId);
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
      return this.messageModel.find({ roomId: roomId }).sort({ id: -1 }).skip(start).limit(end);
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async updateMessage(messageDto: MessageDto): Promise<HttpStatus | Error> {
    try {
      const message = await this.messageModel.findOne({ id: messageDto.id });

      const updatedMessage = {
        _id: message._id,
        id: messageDto.id,
        roomId: messageDto.roomId ? messageDto.roomId : message.roomId,
        userId: messageDto.userId ? messageDto.userId : message.userId,
        text: messageDto.text ? messageDto.text : message.text,
        attachment: messageDto.attachment ? messageDto.attachment : message.attachment,
        timestamp: messageDto.timestamp ? messageDto.timestamp : message.timestamp
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

  async searchMessages(keyword: string): Promise<MessageDocument[] | RpcException> {
    try {
      return this.messageModel.find({ text: keyword });
    } catch (e) {
      console.log(e.stack);
      return new RpcException(e);
    }
  }

  async deleteMessage(rights, messageId, roomId): Promise<HttpStatus | Observable<any>> {
    try {
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
