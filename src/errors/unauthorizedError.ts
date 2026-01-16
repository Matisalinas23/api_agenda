import { CustomError } from "./customError"

export class UnauthorizedError extends CustomError {
    statusCode = 401

    constructor(message: string){
        super(message)
        this.name = "UnauthorizedError"
    }
}