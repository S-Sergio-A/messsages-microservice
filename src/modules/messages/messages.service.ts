import { ClientProxy, ClientProxyFactory, RpcException, Transport } from "@nestjs/microservices";
import { HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Observable } from "rxjs";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";
import { InternalException } from "../exceptions/Internal.exception";
import { ExistingMessageDto } from "./dto/existing-message.dto";
import { MessageDocument } from "./schemas/message.schema";
import { RightsDocument } from "./schemas/rights.schema";
import { NewMessageDto } from "./dto/new-message.dto";
import { UserDocument } from "./schemas/user.schema";

const cloudinary = require("cloudinary").v2;

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel("Message") private readonly messageModel: Model<MessageDocument>,
    @InjectModel("User") private readonly userModel: Model<UserDocument>,
    @InjectModel("Rights") private readonly rightsModel: Model<RightsDocument>
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

  async addMessage(messageDto: NewMessageDto, rights: string[]): Promise<MessageDocument> {
    try {
      messageDto.user = new Types.ObjectId(messageDto.user);
      messageDto.roomId = new Types.ObjectId(messageDto.roomId);

      if (messageDto.attachment) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true
        });

        const length = messageDto.attachment.length <= 5 ? messageDto.attachment.length : 5;

        for (let i = 0; i < length; i++) {
          const result = await cloudinary.uploader.upload(messageDto.attachment[i], {
            overwrite: true,
            invalidate: true,
            folder: `ChatiZZe/${messageDto.roomId}/messages/`,
            public_id: `attachment__${messageDto.user}__${messageDto.roomId}__${messageDto.timestamp}`
          });

          if (result) {
            messageDto.attachment[i] = result.secure_url;
          }
        }
      }

      const createdMessage = new this.messageModel(messageDto);
      await createdMessage.save();
      await this.client.send(
        { cmd: "add-message-reference" },
        {
          rights,
          roomId: messageDto.roomId,
          messageId: createdMessage._id
        }
      );

      await this.client.send(
        { cmd: "add-recent-message" },
        {
          roomId: messageDto.roomId,
          recentMessage: {
            _id: createdMessage._id,
            user: {
              _id: messageDto.user,
              username: messageDto.username
            },
            roomId: createdMessage.roomId,
            text: createdMessage.text,
            attachment: createdMessage.attachment,
            timestamp: createdMessage.timestamp
          }
        }
      );

      return await this.messageModel
        .findOne({ _id: createdMessage._id })
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);
    } catch (e) {
      console.log(e, e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async updateMessage(messageDto: ExistingMessageDto): Promise<HttpStatus | Error> {
    try {
      const message = await this.messageModel.findOne({ _id: new Types.ObjectId(messageDto._id) });

      if (message.user.toString() !== messageDto.user._id) {
        return HttpStatus.FORBIDDEN;
      }

      const updatedMessage = {
        _id: message._id,
        roomId: message.roomId,
        user: message.user,
        text: messageDto.text !== message.text ? messageDto.text : message.text,
        attachment: messageDto.attachment !== message.attachment ? messageDto.attachment : message.attachment,
        timestamp: message.timestamp
      };

      await this.messageModel.updateOne({ _id: message._id }, updatedMessage);
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

      return await this.messageModel
        .find({ roomId: new Types.ObjectId(roomId), text: regex })
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);
    } catch (e) {
      console.log(e.stack);
      return new RpcException(e);
    }
  }

  async deleteMessage(rights: string[], messageId: string, roomId: string, userId: string): Promise<HttpStatus | Observable<any>> {
    try {
      const canDeleteAll =
        rights.includes("DELETE_MESSAGES") && (await this._verifyRights(rights, new Types.ObjectId(userId), new Types.ObjectId(roomId)));

      const query = {
        _id: new Types.ObjectId(messageId),
        roomId: new Types.ObjectId(roomId),
        user: new Types.ObjectId(userId)
      };

      if (canDeleteAll) {
        delete query.user;
      }

      const { deletedCount } = await this.messageModel.deleteOne(query);

      if (deletedCount !== 0) {
        return await this.client.send(
          { cmd: "delete-message-reference" },
          {
            rights,
            userId,
            roomId,
            messageId
          }
        );
      } else {
        return HttpStatus.BAD_REQUEST;
      }
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
      return await this.messageModel
        .find({ roomId: new Types.ObjectId(roomId) })
        .sort({ $natural: -1 })
        .skip(start)
        .limit(end)
        .populate("user", "id firstName lastName birthday username email phoneNumber photo", this.userModel);
    } catch (e) {
      console.log(e.stack);
      throw new InternalException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  async leaveRoom(userId: string, roomId: string): Promise<HttpStatus | Observable<any> | RpcException> {
    try {
      return await this.client.send({ cmd: "delete-user" }, { userId, roomId, type: "LEAVE_ROOM", rights: [""] });
    } catch (e) {
      console.log(e.stack);
      return new RpcException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }

  private async _verifyRights(
    rights: string[],
    user: Types.ObjectId,
    roomId: Types.ObjectId
  ): Promise<boolean | Observable<any> | RpcException> {
    try {
      return await this.rightsModel.exists({ user, roomId, rights });
    } catch (e) {
      console.log(e.stack);
      return new RpcException({
        key: "INTERNAL_ERROR",
        code: GlobalErrorCodes.INTERNAL_ERROR.code,
        message: GlobalErrorCodes.INTERNAL_ERROR.value
      });
    }
  }
}
