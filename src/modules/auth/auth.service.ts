import { ConflictError } from "../../errors/conflictError";
import { ConnectionError } from "../../errors/connectionError";
import { CustomError } from "../../errors/customError";
import { notFoundError } from "../../errors/notFoundError";
import { prisma } from "../../lib/prisma";
import { ICreateUser, IUser } from "../user/user.interface";
import { ILogin } from "./auth.interface";
import { validateLoginUser, validatePassword, validateRegisterUser } from "./auth.validation";
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

export const loginUserService = async (login: ILogin) => {
    validateLoginUser(login)

    try {
        const user: IUser | null = await prisma.user.findUnique({
            where: { email: login.email },
            include: { notes: true }
        })

        if (!user) {
            throw new notFoundError("User not found")
        }

        await validatePassword(login.password, user.password)

        return user
    } catch (error: any) {
        if (error instanceof CustomError) {
            throw error
        }

        throw new ConnectionError("Failed to login user", error)
    }
}
