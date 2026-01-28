import express from "express"
import { authMe, loginUser, refresh, registerUser } from "./auth.controller"
import { authMiddleware } from "../../middleweres/authMiddleware"

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", authMiddleware, authMe);
router.post("/refresh", refresh);

export default router