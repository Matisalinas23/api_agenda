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
import { sendVerificationEmail, sendResetPasswordEmail } from "../../services/email.service";
import { getGoogleUserInfo } from "../../lib/google";
import { ValidationError } from "../../errors/validationError";

// ******************* REGISTER AND LOGIN SECTION ******************* //
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

// Ya no se usa generateRefreshToken como JWT para las sesiones stateful
// const generateRefreshToken = (userId: number, email: string, REFRESH_SECRET: string) => { ... }

export const registerUserService = async (userDto: ICreateUser): Promise<any> => {
    validateRegisterUser(userDto)
    const hashedPassword = await hashPassword(userDto.password!)

    try {
        const user = await prisma.user.create({
            data: {
                email: userDto.email,
                username: userDto.username,
                password: hashedPassword,
                verified: false,
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                verified: true,
                notes: true,
                googleId: true,
            }
        })

        const token = await createVerificationTokenService(user.id, user.email)
        await sendVerificationEmail(user.email, token)

        return user
    } catch (error: any) {
        if (error.code === "P2002") {
            throw new ConflictError("Email was already registered")
        }

        console.error(error)
        throw error
    }
}

export const loginUserService = async (login: ILogin, ipAddress?: string, userAgent?: string) => {
    validateLoginUser(login)

    try {
        const user = await prisma.user.findUnique({
            where: { email: login.email },
        })

        if (!user) throw new UnauthorizedError("Email or password are incorrect");
        if (!user.verified) throw new AutenticationError("User is not verified yet");

        await validatePassword(login.password, user.password!)

        const SECRET = process.env.SECRET
        const token = generateAccessToken(user.id, user.email, SECRET!)
        
        const refreshToken = crypto.randomBytes(40).toString("hex");

        await prisma.session.create({
            data: {
                userId: user.id,
                refreshToken,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                isValid: true
            }
        });

        return { token, refreshToken }
    } catch (error: any) {
        if (error instanceof CustomError) {
            throw error
        }

        console.error(error)
        throw error
    }
}

export const googleLoginService = async (code: string, ipAddress?: string, userAgent?: string) => {
    const googleUser = await getGoogleUserInfo(code);
    const { email, name, id: googleId, picture } = googleUser;

    if (!email) throw new ValidationError("Google account must have an email");

    let user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        // Link account if not already linked or update picture
        if (!user.googleId || user.profileImage !== picture) {
            user = await prisma.user.update({
                where: { email },
                data: { 
                    googleId, 
                    verified: true,
                    profileImage: picture || user.profileImage
                },
            });
        }
    } else {
        // Create new user
        user = await prisma.user.create({
            data: {
                email,
                username: name || email.split("@")[0],
                googleId,
                verified: true,
                profileImage: picture
            },
        });
    }

    const SECRET = process.env.SECRET;
    const token = generateAccessToken(user.id, user.email, SECRET!);
    
    const refreshToken = crypto.randomBytes(40).toString("hex");

    await prisma.session.create({
        data: {
            userId: user.id,
            refreshToken,
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            isValid: true
        }
    });

    return { token, refreshToken };
};

export const refreshTokenService = async (refreshToken: string) => {
    const session = await prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true }
    });

    if (!session || !session.isValid) {
        throw new UnauthorizedError("Session is invalid or expired");
    }

    if (session.expiresAt < new Date()) {
        await prisma.session.update({ where: { id: session.id }, data: { isValid: false } });
        throw new UnauthorizedError("Session expired");
    }

    const SECRET = process.env.SECRET
    const newAccessToken = generateAccessToken(session.userId, session.user.email, SECRET!);

    return newAccessToken;
}

export const logoutService = async (refreshToken: string) => {
    if (!refreshToken) return;
    try {
        await prisma.session.update({
            where: { refreshToken },
            data: { isValid: false }
        });
    } catch (error) {
        console.error("Error logging out session:", error);
    }
}

export const getSessionsService = async (userId: number) => {
    return await prisma.session.findMany({
        where: {
            userId,
            isValid: true,
            expiresAt: { gt: new Date() }
        },
        select: {
            id: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
    });
}

export const revokeSessionService = async (sessionId: string, userId: number) => {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!session || session.userId !== userId) {
        throw new NotFoundError("Session not found or unauthorized");
    }

    await prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
    });
}



// ******************* OTHER SERVICES ******************* //

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

    return token;
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

export const forgotPasswordService = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return { message: "Si existe una cuenta asociada a este correo, se ha enviado un enlace para restablecer la contraseña." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
        data: {
            token,
            userId: user.id,
            expiresAt
        }
    });

    await sendResetPasswordEmail(user.email, token);

    return { message: "Si existe una cuenta asociada a este correo, se ha enviado un enlace para restablecer la contraseña." };
}

export const resetPasswordService = async (token: string, newPassword: string) => {
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
    });

    if (!resetToken) throw new UnauthorizedError("Token inválido o expirado.");
    
    if (resetToken.expiresAt < new Date()) {
        await prisma.passwordResetToken.delete({ where: { token } });
        throw new UnauthorizedError("Token expirado.");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { id: resetToken.userId },
        data: { 
            password: hashedPassword,
            verified: true // If they can reset password, they've verified their email
        }
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    return { message: "Contraseña actualizada correctamente." };
}
