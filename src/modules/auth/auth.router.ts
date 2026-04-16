import express from "express"
import { authMe, forgotPassword, getGoogleAuthUrl, googleCallback, loginUser, refresh, registerUser, resetPassword, verifyEmail } from "./auth.controller"
import { authMiddleware } from "../../middleweres/authMiddleware"

const router = express.Router()

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, authMe);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);

router.get("/google", getGoogleAuthUrl);
router.get("/google/callback", googleCallback);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router