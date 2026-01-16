import { ValidationError } from "../../errors/validationError";

export function validateUserId(id: unknown) {
    if (!id) {
        throw new ValidationError("User id is required")
    }

    if (typeof id !== "string") {
        throw new ValidationError("User id must be a string")
    }

    if (isNaN(Number(id))) {
        throw new ValidationError("User id must be a number character")
    }
}