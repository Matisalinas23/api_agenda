import { CustomError } from "./customError";

export class ValidationError extends CustomError {
    statusCode = 400
    details?: any

    constructor(message: string, details?: any){
        super(message)
        this.name = "ValidationError"
        this.details = details
    }
}