import { ValidationError } from "../../errors/validationError";
import { ICreateUser } from "../user/user.interface";

export function validateRegisterUser(user: ICreateUser): void {
    if (!user.email) {
        throw new ValidationError("Email is required")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(user.email)) {
        throw new ValidationError("Email format is wrong")
    }

    if (!user.username) {
        throw new ValidationError("Username is required")
    }

    if (!user.password) {
        throw new ValidationError("Password is required")
    }

    if (user.password.length < 6) {
        throw new ValidationError("Password must be 6 or more characters")
    }
}