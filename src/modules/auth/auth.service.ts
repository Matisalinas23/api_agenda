import { ConflictError } from "../../errors/conflictError";
import { CustomError } from "../../errors/customError";
import { DatabaseError } from "../../errors/databaseError";
import { NotFoundError } from "../../errors/notFoundError";
import { UnauthorizedError } from "../../errors/unauthorizedError";
import { prisma } from "../../lib/prisma";
import { ICreateUser, IUser } from "../user/user.interface";
import { ILogin } from "./auth.interface";
import { validateLoginUser, validatePassword, validateRegisterUser } from "./auth.validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

const sendVerificationEmail = async (email: string, token: string) => {

    const { error, data } = await resend.emails.send({
        from: "Agenda <onboarding@resend.dev>",
        to: email,
        subject: "Verifica tu cuenta",
        html: `
            <h2>Bienvenido a Agenda Web</h2>
            <p>Introduce el siguiente código de confirmación para verificar tu cuenta</p>
            <p>${token}</p>
            <p>Este código expirará en 10 minutos</p>
        `,
    });

    if (error) {
        console.log(error)
        throw new Error(error.message);
    }
}

interface IRegister {
    user: IUser
    verificationToken: string
}

export const registerUserService = async (userDto: ICreateUser): Promise<IRegister> => {
    validateRegisterUser(userDto)
    const hashedPassword = await hashPassword(userDto.password)

    try {
        const user: IUser = await prisma.user.create({
            data: {
                email: userDto.email,
                username: userDto.username,
                password: hashedPassword,
            },
            include: {
                notes: true
            }
        })

        const verificationToken: string = await createVerificationTokenService(user.id, user.email)

        return { user, verificationToken }
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
            include: { notes: true }
        })

        if (!user) throw new UnauthorizedError("Email or password are incorrect")
        if (!user.verified) throw new UnauthorizedError("User is not verified yet")

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

    return token
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
