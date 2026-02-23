import { CustomError } from "./customError"

export class AutenticationError extends CustomError {
    statusCode = 403
    details?: any

    constructor(message: string, details?: any){
        super(message)
        this.name = "AutenticationError"
        this.details = details
    }
}