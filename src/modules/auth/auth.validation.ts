import { UnauthorizedError } from "../../errors/unauthorizedError"; 
import { ValidationError } from "../../errors/validationError";
import { ICreateUser } from "../user/user.interface";
import { ILogin } from "./auth.interface";
import bcrypt from "bcrypt"

export function validateRegisterUser(user: ICreateUser): void {
    const { email, username, password } = user

    if (!email) {
        throw new ValidationError("Email is required")
    }
    if (typeof email !== "string") {
        throw new ValidationError("Email must bu a string")
    }
    if (email.length > 36) {
        throw new ValidationError("Email must have 36 or less characters")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(user.email)) {
        throw new ValidationError("Email format is wrong")
    }

    if (!username) {
        throw new ValidationError("Username is required")
    }
    if (typeof username !== "string") {
        throw new ValidationError("Username must bu a string")
    }
    if (username.length > 20) {
        throw new ValidationError("Username must have 20 or less characters")
    }

    if (password) {
        throw new ValidationError("Password is required")
    }
    if (typeof password !== "string") {
        throw new ValidationError("Password must bu a string")
    }
    if (password.length < 6 || password.length > 24) {
        throw new ValidationError("Password must have minimun 6 characters and maximun 24 characters")
    }
}

export function validateLoginUser(login: ILogin) {
    const { email, password } = login
    
    if (!email) {
        throw new ValidationError("Email is required")
    }

    if (!password) {
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
