import { NextFunction, Request, Response } from "express"
import { loginUserService, registerUserService } from "./auth.service"

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
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}
