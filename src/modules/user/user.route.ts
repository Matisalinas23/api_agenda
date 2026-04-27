import express from "express"
import { getAllUsers, getUser, triggerCleanup } from "./user.controller"
import { authMiddleware } from "../../middleweres/authMiddleware"

const router = express.Router()

router.post("/trigger-cleanup", triggerCleanup) // Generalmente solo para admins o tests

router.get("/:id", getUser)
router.get("/", getAllUsers)
export default router