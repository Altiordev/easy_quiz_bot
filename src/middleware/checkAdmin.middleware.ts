import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../enums/status-code.enum";
import AuthService from "../auth/auth.service";
import { IUser } from "../interfaces/auth.interface";
import { ErrorMessage } from "../enums/error-message.enum";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../errors/errors";

export const checkAdminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authService: AuthService = new AuthService();

    const chatId: string = req.headers["authorization"] || "chatId";
    if (!chatId) next(new UnauthorizedError());
    if (isNaN(Number(chatId)))
      return next(new BadRequestError(ErrorMessage.CHAT_ID_MUST_BE_NUMBER));

    const admin: IUser | null = await authService.findUserByChatId(
      Number(chatId),
    );
    if (!admin) next(new ForbiddenError());

    next();
  } catch (error) {
    res.status(StatusCode.BadRequest).json(error);
  }
};
