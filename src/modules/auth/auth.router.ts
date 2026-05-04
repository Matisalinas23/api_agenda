import express from "express"
import { authMe, forgotPassword, getGoogleAuthUrl, googleCallback, loginUser, refresh, registerUser, resetPassword, verifyEmail, logoutUser, getSessions, revokeSession, requestAccountDeletion, reactivateAccount } from "./auth.controller"
import { authMiddleware } from "../../middleweres/authMiddleware"

const router = express.Router()

router.get("/google/callback", googleCallback);
router.delete("/sessions/:id", authMiddleware, revokeSession);

router.get("/google", getGoogleAuthUrl);
router.get("/me", authMiddleware, authMe);
router.get("/sessions", authMiddleware, getSessions);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/request-deletion", authMiddleware, requestAccountDeletion);
router.post("/reactivate", reactivateAccount);

export default router