import dns from "node:dns"
import dotenv from "dotenv"
dotenv.config()

import app from "./app"
import { initCronJobs } from "./cron"

dns.setDefaultResultOrder("ipv4first");

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`)
    initCronJobs()
})
console.log("Node version:", process.version);