import { NextFunction, Request, Response } from "express";
import { getAllUsersService } from "./user.service";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await getAllUsersService()
        res.status(200).json(users)
    } catch (error) {
        next()
    }
}