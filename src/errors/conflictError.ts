import { CustomError } from "./customError"

export class ConflictError extends CustomError {
    statusCode = 409
    details?: any

    constructor(message: string, details?: any){
        super(message)
        this.name = "ConflictError"
        this.details = details
    }
}
