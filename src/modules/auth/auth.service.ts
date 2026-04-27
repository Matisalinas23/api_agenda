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
import { sendVerificationEmail, sendResetPasswordEmail, sendDeleteAccountEmail, sendAccountDeactivationEmail } from "../../services/email.service";
import { getGoogleUserInfo } from "../../lib/google";
import { ValidationError } from "../../errors/validationError";

// ******************* REGISTER AND LOGIN SECTION ******************* //
const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10)
}

export const generateAccessToken = (userId: number, email: string, SECRET: string, deleteAfter?: Date | null) => {
    return jwt.sign(
        {
            userId,
            email,
            deleteAfter: deleteAfter || null
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
        
        if (user.deleteAfter) {
            throw new UnauthorizedError("Tu cuenta está en proceso de eliminación. Revisa tu correo para rehabilitarla.");
        }

        await validatePassword(login.password, user.password!)

        const SECRET = process.env.SECRET
        const token = generateAccessToken(user.id, user.email, SECRET!, user.deleteAfter)
        
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

        if (user.deleteAfter) {
            throw new UnauthorizedError("Tu cuenta está en proceso de eliminación. Revisa tu correo para rehabilitarla.");
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
    const token = generateAccessToken(user.id, user.email, SECRET!, user.deleteAfter);
    
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
    const newAccessToken = generateAccessToken(session.userId, session.user.email, SECRET!, session.user.deleteAfter);

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

export const requestAccountDeletionService = async (userId: number, password?: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Usuario no encontrado");

    // Si el usuario tiene contraseña (no es login social), validamos
    if (user.password) {
        if (!password) throw new ValidationError("La contraseña es requerida para eliminar la cuenta");
        await validatePassword(password, user.password);
    }

    const deleteAfter = new Date();
    deleteAfter.setDate(deleteAfter.getDate() + 5);

    const reactivationToken = crypto.randomBytes(32).toString("hex");
    
    // Usamos una transacción para asegurar consistencia
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { deleteAfter }
        }),
        prisma.accountReactivationToken.deleteMany({ where: { userId } }),
        prisma.accountReactivationToken.create({
            data: {
                token: reactivationToken,
                userId,
                expiresAt: deleteAfter // El token expira cuando la cuenta se borra
            }
        }),
        // Por seguridad, invalidamos todas las sesiones activas
        prisma.session.updateMany({
            where: { userId },
            data: { isValid: false }
        })
    ]);

    await sendAccountDeactivationEmail(user.email, reactivationToken);

    return { message: "Tu cuenta ha sido inhabilitada y será eliminada permanentemente en 5 días. Revisa tu correo para más información." };
}

export const reactivateAccountService = async (token: string) => {
    const reactivationToken = await prisma.accountReactivationToken.findUnique({
        where: { token },
        include: { user: true }
    });

    if (!reactivationToken) {
        throw new UnauthorizedError("Token de rehabilitación inválido o expirado.");
    }

    // Si por alguna razón el token sigue ahí pero el usuario ya fue borrado (no debería pasar por el Cascade)
    if (!reactivationToken.user) {
        await prisma.accountReactivationToken.delete({ where: { token } });
        throw new NotFoundError("Usuario no encontrado.");
    }

    // Rehabilitar la cuenta
    await prisma.user.update({
        where: { id: reactivationToken.userId },
        data: { deleteAfter: null }
    });

    // Borrar el token usado
    await prisma.accountReactivationToken.delete({ where: { token } });

    return { message: "¡Bienvenido de nuevo! Tu cuenta ha sido rehabilitada con éxito. Ya puedes iniciar sesión normalmente." };
}
