import express from "express"
import { authMe, loginUser, refresh, registerUser, verifyEmail } from "./auth.controller"
import { authMiddleware } from "../../middleweres/authMiddleware"

const router = express.Router()

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, authMe);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);

export default router