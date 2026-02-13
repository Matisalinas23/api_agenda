import { CustomError } from "./customError"

export class UnauthorizedError extends CustomError {
    statusCode = 401
    details?: any

    constructor(message: string, details?: any){
        super(message)
        this.name = "UnauthorizedError"
        this.details = details
    }
}