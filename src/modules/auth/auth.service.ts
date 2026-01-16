import { ConflictError } from "../../errors/conflictError";
import { ConnectionError } from "../../errors/connectionError";
import { prisma } from "../../lib/prisma";
import { ICreateUser } from "../user/user.interface";
import { validateRegisterUser } from "./auth.validation";
import bcrypt from "bcrypt"

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

export const registerUserService = async (user: ICreateUser) => {
    validateRegisterUser(user)
    const hashedPassword = await hashPassword(user.password)

    try {
        return await prisma.user.create({
            data: {
                email: user.email,
                username: user.username,
                password: hashedPassword,
            },
            include: {
                notes: true
            }
        })
    } catch (error: any) {
        if (error.code === "P2002") {
            throw new ConflictError("Email was already registered")
        }

        throw new ConnectionError("Failed to register user", error)
    }
}