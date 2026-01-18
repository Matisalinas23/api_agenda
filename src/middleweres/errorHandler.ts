import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/customError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(err)
    
    if (err instanceof CustomError) {
        return res.status(err.statusCode).json({
            error: err.name,
            message: err.message
        })
    }

    res.status(500).json({
        error: "InternalServerError",
        message: "Unespected error"
    })
}