import { UnauthorizedError } from "../../errors/UnauthorizedError";
import { ValidationError } from "../../errors/validationError";
import { ICreateUser } from "../user/user.interface";
import { ILogin } from "./auth.interface";
import bcrypt from "bcrypt"

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

export function validateLoginUser(login: ILogin) {
    if (!login.email) {
        throw new ValidationError("Email is required")
    }

    if (!login.password) {
        throw new ValidationError("Password is required")
    }
}

export async function validatePassword(loginPassword: string, userPassword: string) {
    const match = await bcrypt.compare(loginPassword, userPassword)

    if (!match) {
        console.log("FALSE")
        throw new UnauthorizedError("Password or email are incorrect")
    }
}
