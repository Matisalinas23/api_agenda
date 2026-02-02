import { ConflictError } from "../../errors/conflictError";
import { ConnectionError } from "../../errors/connectionError";
import { CustomError } from "../../errors/customError";
import { DatabaseError } from "../../errors/databaseError";
import { notFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { prisma } from "../../lib/prisma";
import { ICreateUser } from "../user/user.interface";
import { ILogin } from "./auth.interface";
import { validateLoginUser, validatePassword, validateRegisterUser } from "./auth.validation";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

const generateAccessToken = (userId: number, email: string, SECRET: string) => {
    return jwt.sign(
        {
            userId,
            email
        },
        SECRET,
        { "expiresIn": "5m" }
    );
}

const generateRefreshToken = (userId: number, email: string, REFRESH_SECRET: string) => {
    return jwt.sign(
        {
            userId,
            email
        },
        REFRESH_SECRET,
        { "expiresIn": "1d" }
    );
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

        throw new DatabaseError("Failed to register user")
    }
}

export const loginUserService = async (login: ILogin) => {
    validateLoginUser(login)

    try {
        const user = await prisma.user.findUnique({
            where: { email: login.email },
            include: { notes: true }
        })

        if (!user) throw new UnauthorizedError("Email or password are incorrect")

        await validatePassword(login.password, user.password)

        const SECRET = process.env.SECRET
        const REFRESH_SECRET = process.env.REFRESH_SECRET
        const token = generateAccessToken(user.id, user.email, SECRET!)
        const refreshToken = generateRefreshToken(user.id, user.email, REFRESH_SECRET!)

        return { token, refreshToken }
    } catch (error: any) {        
        if (error instanceof CustomError) {
            throw error
        }

        throw new DatabaseError("Failed to login user")
    }
}

export const refreshTokenService = async (refreshToken: string) => {
    const REFRESH_SECRET = process.env.REFRESH_SECRET;

    const payload = jwt.verify(refreshToken, REFRESH_SECRET!) as {
        userId: number;
        email: string;
    };

    const user = await prisma.user.findUnique({
        where: { id: Number(payload.userId) }
    });

    if (!user) throw new notFoundError("User not found");

    const SECRET = process.env.SECRET
    const newAccessToken = generateAccessToken(user.id, user.email, SECRET!);

    return newAccessToken;
}
