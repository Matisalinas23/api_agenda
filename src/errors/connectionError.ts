import { CustomError } from "./customError";

export class ConnectionError extends CustomError {
  statusCode = 503

  constructor(message = "Service unavailable", originalError?: unknown) {
    super(message, originalError)
  }
}