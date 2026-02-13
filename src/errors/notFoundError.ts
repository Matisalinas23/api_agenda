import { CustomError } from "./customError"

export class NotFoundError extends CustomError {
  statusCode = 404
  details?: any

  constructor(message: string, details?: any) {
    super(message)
    this.name = "NotFoundError"
    this.details = details
  }
}