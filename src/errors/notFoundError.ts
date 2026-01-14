import { CustomError } from "./customError"

export class notFoundError extends CustomError {
  statusCode = 404

  constructor(message: string) {
    super(message)
  }
}