import { CustomError } from "./customError";

export class ConnectionError extends CustomError {
  statusCode = 503
  details?: any

  constructor(message = "Service unavailable", originalError?: unknown, details?: any) {
    super(message, originalError)
    this.name = "ConnectionError"
    this.details = details
  }
}