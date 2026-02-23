import express from "express";
import { runDueDateReminders } from "./internal.controller";

const router = express.Router()

router.get("/limit-date-reminders", runDueDateReminders)

export default router