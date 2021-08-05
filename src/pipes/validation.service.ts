import { Injectable } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";
import { GlobalErrorCodes } from "../exceptions/errorCodes/GlobalErrorCodes";
import { ExistingMessageDto } from "../messages/dto/existing-message.dto";
import { InternalFailure } from "./interfaces/internal-failure.interface";
import { Message } from "./interfaces/message";

@Injectable()
export class ValidationService {
  async validateMessage(data: ExistingMessageDto) {
    let errors: Partial<Message & InternalFailure> = {};

    try {
      console.log(data);
      if (await this._isEmpty(data.roomId)) {
        errors.roomId = GlobalErrorCodes.EMPTY_ERROR.value;
      }

      if (await this._isEmpty(data.timestamp)) {
        const date = Date.now();
        const localTime = new Date(date).toLocaleTimeString("ru-RU").substring(0, 5);
        const localDate = new Date(date).toLocaleDateString("ru-RU");

        data.timestamp = `${localTime} ${localDate}`;
      }

      if (await this._isEmpty(data.text)) {
        errors.text = GlobalErrorCodes.EMPTY_ERROR.value;
      } else {
        data.text = sanitizeHtml(data.text);
        //  data.text = sanitizeHtml(data.text, {
        //   allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
        //   allowedAttributes: {
        //     'a': [ 'href' ]
        //   },
        //   allowedIframeHostnames: ['www.youtube.com']
        // });
      }

      if (await this._isEmpty(data.user)) {
        errors.user = GlobalErrorCodes.NO_USER_ID.value;
      }
    } catch (err) {
      errors.internalFailure = err;
    }

    return {
      errors,
      isValid: await this._isEmpty(errors)
    };
  }

  private async _isEmpty(obj) {
    if (obj !== undefined && obj !== null) {
      let isString = typeof obj === "string" || obj instanceof String;
      if ((typeof obj === "number" || obj instanceof Number) && obj !== 0) {
        return false;
      }
      return (
        obj === "" ||
        obj === 0 ||
        (Object.keys(obj).length === 0 && obj.constructor === Object) ||
        obj.length === 0 ||
        (isString && obj.trim().length === 0)
      );
    } else {
      return "type is undefined or null";
    }
  }
}