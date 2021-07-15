import { PipeTransform, ArgumentMetadata, BadRequestException, Injectable } from "@nestjs/common";
import { ValidationException } from "../../exceptions/Validation.exception";
import { ValidationService } from "./validation.service";

@Injectable()
export class MessageValidationPipe implements PipeTransform {
  async transform(value, metadata: ArgumentMetadata) {
    value = JSON.parse(value);

    if (!value) {
      throw new BadRequestException("No data submitted");
    }

    const { errors, isValid } = await ValidationService.prototype.validateMessage(value);

    if (isValid) {
      return value;
    } else {
      throw new ValidationException(errors);
    }
  }
}
