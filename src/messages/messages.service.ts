import { Client, ClientProxy, ClientRedis, Transport } from "@nestjs/microservices";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message } from "./interfaces/message.interface";
import { MessageDto } from "./dto/message.dto";

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel("Message") private readonly messageModel: Model<Message>
  ) {}

  async addMessage(messageDto: MessageDto): Promise<HttpStatus> {
    const createdMessage = new this.messageModel(messageDto);
    await createdMessage.save();
    await this._addMessageReferenceToRoom(messageDto.id, messageDto.roomId);

    return HttpStatus.CREATED;
  }

  async getRoomMessagesLimited(roomId: string, start: number = 0, end: number = 50): Promise<Message[]> {
    return this.messageModel.find({ roomId: roomId }).sort({ id: -1 }).skip(start).limit(end);
  }

  async updateMessage(messageDto: MessageDto): Promise<HttpStatus> {
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
  }

  async searchMessages(keyword: string): Promise<Message[] | null> {
    return this.messageModel.find({ text: keyword });
  }

  async deleteMessage(messageId, roomId): Promise<HttpStatus> {
    const { deletedCount } = await this.messageModel.deleteOne({ id: messageId });

    if (deletedCount !== 0) {
      await this._deleteMessageReferenceFromRoom(messageId, roomId);
      return HttpStatus.OK;
    }

    return HttpStatus.BAD_REQUEST;
  }

  @Client({
    transport: Transport.REDIS,
    options: {
      url: `redis://${process.env.REDIS_DB_NAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_ENDPOINT}:${process.env.REDIS_PORT}`,
      retryDelay: 3000,
      retryAttempts: 10
    }
  })
  private client: ClientRedis;

  async onApplicationBootstrap(): Promise<void> {
    await this.client.connect();
  }

  private async _onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  private async _addMessageReferenceToRoom(messageId: string, roomId: string): Promise<HttpStatus> {
    // await this._onModuleInit();
    return await this.client.send({ cmd: "add-message-reference" }, { messageId, roomId }).toPromise();
  }

  private async _deleteMessageReferenceFromRoom(messageId: string, roomId: string): Promise<HttpStatus> {
    // await this._onModuleInit();
    return await this.client.send({ cmd: "delete-message-reference" }, { messageId, roomId }).toPromise();
  }
}
