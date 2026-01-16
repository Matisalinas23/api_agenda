import { NextFunction, Request, Response } from "express";
import { getAllUsersService, getUserService } from "./user.service";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsersService()
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await getUserService(req.params.id)
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}