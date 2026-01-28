import { NextFunction, Request, Response } from "express"
import { loginUserService, refreshTokenService, registerUserService } from "./auth.service"
import { ValidationError } from "../../errors/validationError"

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
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 24*60*60*1000
        });

        res.status(200).json(token)
    } catch (error) {
        next(error)
    }
}

export const authMe = async (req: Request, res: Response): Promise<void> => {
  res.json({ user: req.user });
}

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken

        if(!refreshToken) {
            throw new ValidationError("No refresh token provided");
        }

        const accessToken = await refreshTokenService(refreshToken);

        res.json(accessToken);
    } catch (error) {
        next(error);
    }
}
