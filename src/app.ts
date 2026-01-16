import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import { errorHandler } from "./middleweres/errorHandler"
import notesRoutes from "./modules/notes/note.router"
import authRoutes from "./modules/auth/auth.router"
import usersRoutes from "./modules/user/user.route"

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors())

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK" })
})
app.use("/notes", notesRoutes)
app.use("/auth", authRoutes)
app.use("/users", usersRoutes)

app.use(errorHandler)

export default app