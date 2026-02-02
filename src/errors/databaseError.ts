import { CustomError } from "./customError"

export class DatabaseError extends CustomError {
    statusCode = 500

    constructor(message: string){
        super(message)
        this.name = "DatabaseError"
    }
}