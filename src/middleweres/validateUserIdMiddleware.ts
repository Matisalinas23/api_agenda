import { Request, Response, NextFunction } from "express";

export const validateUserIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({
            message: "El ID de usuario proporcionado es inválido o no tiene el formato correcto."
        });
    }

    const parsedId = Number(userId);

    if (Number.isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
        return res.status(400).json({
            message: "El ID de usuario proporcionado es inválido o no tiene el formato correcto."
        });
    }

    next();
};
