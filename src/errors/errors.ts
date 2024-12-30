// BaseError class
export class BaseError extends Error {
  public statusCode: number;
  public message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    // Ensure the name of the error matches the class name
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace if needed for debugging
    Error.captureStackTrace(this, this.constructor);
  }

  // Convert error object to JSON
  public toJSON() {
    return {
      status: this.statusCode,
      message: this.message,
    };
  }
}

// Custom Error classes
export class BadRequestError extends BaseError {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Resource Not Found") {
    super(404, message);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Forbidden") {
    super(409, message);
  }
}

export class ValidationError extends BaseError {
  constructor(message = "Validation error") {
    super(422, message);
  }
}

export class InternalServerError extends BaseError {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}
