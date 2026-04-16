import { NextFunction, Request, Response } from "express"
import { loginUserService, refreshTokenService, registerUserService, verifyEmailByTokenService, googleLoginService, forgotPasswordService, resetPasswordService } from "./auth.service"
import { ValidationError } from "../../errors/validationError"
import { getGoogleAuthUrl as generateGoogleUrl } from "../../lib/google"
import { prisma } from "../../lib/prisma"

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await registerUserService(req.body)
        res.status(201).json(user)
    } catch (error) {
        next(error)
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, refreshToken } = await loginUserService(req.body)

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Debería ser true en producción (HTTPS)
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json(token)
    } catch (error) {
        next(error)
    }
}

export const authMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: (req.user as any).userId },
            select: {
                id: true,
                email: true,
                username: true,
                profileImage: true,
                verified: true
            }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user data" });
    }
}

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken

        if (!refreshToken) {
            throw new ValidationError("No refresh token provided");
        }

        const accessToken = await refreshTokenService(refreshToken);

        res.json(accessToken);
    } catch (error) {
        next(error);
    }
}

export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
    const result = await verifyEmailByTokenService(String(token));

    res.status(200).json(result);
};

export const getGoogleAuthUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const url = generateGoogleUrl();
        res.json({ url });
    } catch (error) {
        next(error);
    }
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { code } = req.query;
        if (!code) throw new ValidationError("No code provided");

        const { token, refreshToken } = await googleLoginService(String(code));

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000, // Matching the standard login
        });

        const frontendUrl = "http://localhost:5173";
        res.redirect(`${frontendUrl}/#token=${token}`);
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) throw new ValidationError("Email requerido");

        const result = await forgotPasswordService(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) throw new ValidationError("Token y nueva contraseña requeridos");

        const result = await resetPasswordService(token, newPassword);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
