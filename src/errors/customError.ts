export abstract class CustomError extends Error {
  abstract statusCode: number
  originalError?: unknown

  constructor(message: string, originalError?: unknown) {
    super(message)
    this.originalError = originalError
    Object.setPrototypeOf(this, new.target.prototype)
  }
}