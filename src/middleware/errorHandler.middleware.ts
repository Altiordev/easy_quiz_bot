import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors/errors";

export const errorHandler = (
  err: BaseError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
    });
  }
};
