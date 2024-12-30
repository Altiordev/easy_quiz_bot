import { NextFunction, Request, Response } from "express";
import AuthService from "./auth.service";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../errors/errors";
import { ErrorMessage } from "../enums/error-message.enum";
import { StatusCode } from "../enums/status-code.enum";

export default class AuthController {
  private service: AuthService = new AuthService();

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isNaN(Number(req.params.chat_id)))
        return next(new BadRequestError(ErrorMessage.CHAT_ID_MUST_BE_NUMBER));

      const user = await this.service.findUserByChatId(
        Number(req.params.chat_id),
      );
      if (!user) return next(new UnauthorizedError());

      if (user.isAdmin) {
        res
          .status(StatusCode.Ok)
          .send({
            message: "successfully logged in",
            chat_id: Number(user.chat_id),
          });
      } else {
        next(new ForbiddenError());
      }
    } catch (error) {
      next(error);
    }
  };
}
