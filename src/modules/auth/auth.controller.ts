import { NextFunction, Request, Response } from "express"
import { loginUserService, registerUserService } from "./auth.service"
import jwt from "jsonwebtoken"

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
        const user = await loginUserService(req.body)
        const SECRET = process.env.SECRET

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            SECRET!,
            { "expiresIn": "1h" }
        )

        res.status(200).json({
            token: token,
            user: user
        })
    } catch (error) {
        next(error)
    }
}
