import dotenv from "dotenv"
dotenv.config()

import app from "./app"
import { initCronJobs } from "./cron"

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
    initCronJobs()
})