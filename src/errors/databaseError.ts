import { CustomError } from "./customError"

export class DatabaseError extends CustomError {
    statusCode = 500
    details?: any

    constructor(message: string, details?: any){
        super(message)
        this.name = "DatabaseError"
        this.details = details
    }
}