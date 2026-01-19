import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import authRoute from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json()) // req body
app.use(cookieParser())

app.use("/api/auth", authRoute)

app.listen(PORT, () => {
    console.log("server started on port: " + PORT)
    connectDB()  // database connection 
})