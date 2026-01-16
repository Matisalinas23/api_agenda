import { CustomError } from "./customError"

export class ConflictError extends CustomError {
    statusCode = 409

    constructor(message: string){
        super(message)
        this.name = "ConflictError"
    }
}
