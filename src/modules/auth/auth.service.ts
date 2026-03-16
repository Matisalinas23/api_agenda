import { ConflictError } from "../../errors/conflictError";
import { CustomError } from "../../errors/customError";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { prisma } from "../../lib/prisma";
import { ICreateUser, IUser } from "../user/user.interface";
import { ILogin } from "./auth.interface";
import { validateLoginUser, validatePassword, validateRegisterUser } from "./auth.validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AutenticationError } from "../../errors/autenticationError";
import { sendVerificationEmail } from "../../services/email.service";

const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

export const generateAccessToken = (userId: number, email: string, SECRET: string) => {
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

export const registerUserService = async (userDto: ICreateUser): Promise<any> => {
    validateRegisterUser(userDto)
    const hashedPassword = await hashPassword(userDto.password)

    try {
        const user = await prisma.user.create({
            data: {
                email: userDto.email,
                username: userDto.username,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true, // si existe en tu modelo
                notes: true
            }
        })

        await createVerificationTokenService(user.id, user.email)

        return user
    } catch (error: any) {
        if (error.code === "P2002") {
            throw new ConflictError("Email was already registered")
        }

        console.error(error)
        throw error
    }
}

export const loginUserService = async (login: ILogin) => {
    validateLoginUser(login)

    try {
        const user = await prisma.user.findUnique({
            where: { email: login.email },
        })

        if (!user) throw new UnauthorizedError("Email or password are incorrect");
        if (!user.verified) throw new AutenticationError("User is not verified yet");

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

        console.error(error)
        throw error
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

    if (!user) throw new NotFoundError("User not found");

    const SECRET = process.env.SECRET
    const newAccessToken = generateAccessToken(user.id, user.email, SECRET!);

    return newAccessToken;
}

export const createVerificationTokenService = async (userId: number, email: string) => {
    const token = crypto.randomInt(100000, 1000000).toString(); // length 6

    await prisma.verificationToken.deleteMany({
        where: { userId }
    });

    await prisma.verificationToken.create({
        data: {
            token,
            userId: Number(userId),
            expiresAt: new Date(Date.now() + 1000 * 60 * 10)
        }
    })

    await sendVerificationEmail(email, token)
}

export const verifyEmailByTokenService = async (token: string) => {
  if (!token) {
    throw new UnauthorizedError("Token requerido");
  }

  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification) throw new UnauthorizedError("Token inválido");
  if (verification.expiresAt < new Date()) throw new UnauthorizedError("Token expirado");

  await prisma.user.update({
    where: { id: verification.userId },
    data: { verified: true },
  });

  await prisma.verificationToken.delete({
    where: { token },
  });

  return { message: "Cuenta verificada correctamente" };
};
