import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import notesRoutes from "./modules/notes/note.router"
import authRoutes from "./modules/auth/auth.router"
import usersRoutes from "./modules/user/user.route"
import { errorHandler } from "./middleweres/errorHandler"
import cookieParser from "cookie-parser"

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:4173", "https://agenda-web-olive.vercel.app"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}))
app.use(cookieParser());

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" })
})
app.use("/notes", notesRoutes)
app.use("/auth", authRoutes)
app.use("/users", usersRoutes)

app.use(errorHandler)

export default app