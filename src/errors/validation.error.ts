import { ErrorMessage } from "../enums/error-message.enum";
import { StatusCode } from "../enums/status-code.enum";
import { IError } from "../interfaces/interfaces";

export class ValidationError implements IError {
  public statusCode: StatusCode = StatusCode.UnprocessableEntity;
  public message: ErrorMessage;
  public data: object;

  constructor(data: object) {
    this.message = ErrorMessage.ValidationError;
    this.data = data;
  }
}
