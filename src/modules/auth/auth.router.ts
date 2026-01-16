import express from "express"
import { registerUser } from "./auth.controller"

const router = express.Router()

router.post("/", registerUser)

export default router