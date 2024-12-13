import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from "@nestjs/common";
import { ValidationException } from "../exceptions/Validation.exception";
import { ValidationService } from "./validation.service";

@Injectable()
export class MessageValidationPipe implements PipeTransform {
  async transform(value, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException("No data submitted");
    }

    if (value.hasOwnProperty("text")) {
      const { error, isValid } = await ValidationService.prototype.validateMessage(value);

      if (isValid) {
        return value;
      } else {
        console.log(error);
        throw new ValidationException(error);
      }
    }
  }
}
