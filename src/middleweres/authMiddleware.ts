import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { IJwtPayload } from "../modules/auth/auth.interface"

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ message: "Token was not provided" })
    }

    const token = authHeader.split(" ")[1]
    const SECRET = process.env.SECRET

    try {
        const payload = jwt.verify(token, SECRET!) as IJwtPayload
        req.user = payload
        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" })
    }
}