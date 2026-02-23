import { NextFunction, Request, Response } from "express"
import { runDueDateRemindersService } from "./internal.service"

export const runDueDateReminders = async (req: Request, res: Response, next: NextFunction) => {
  if (req.headers["x-api-key"] !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  await runDueDateRemindersService()
  res.status(200).json({ message: "Reminders processed" })
}