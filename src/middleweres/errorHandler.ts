import { NextFunction, Request, Response } from "express";
import { CustomError } from "../errors/customError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            error: err.name,
            message: err.message
        })
    }

    console.log(err)

    res.status(500).json({
        error: "InternalServerError",
        message: "Unespected error"
    })
}