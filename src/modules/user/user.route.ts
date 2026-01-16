import express from "express"
import { getAllUsers, getUser } from "./user.controller"

const router = express.Router()

router.get("/:id", getUser)
router.get("/", getAllUsers)

export default router