import { NextFunction, Request, Response } from "express";
import { cleanupExpiredAccountsService, getAllUsersService, getUserService } from "./user.service";
import { sendYourAccountWasDeletedEmail } from "../../services/email.service";

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

/**
 * Endpoint to manually trigger the cleanup task (optional, for admin or testing)
 */
export const triggerCleanup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await cleanupExpiredAccountsService();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
