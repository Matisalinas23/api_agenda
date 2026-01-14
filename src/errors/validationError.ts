import { CustomError } from "./customError";

export class ValidationError extends CustomError {
    statusCode = 400

    constructor(message: string){
        super(message)
    }
}