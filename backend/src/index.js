import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import authRoute from "./routes/auth.route.js"
import messageRoute from "./routes/friends.route.js"
import { connectDB } from "./lib/db.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 3000

app.use(express.json({ limit: "5mb" })) // req body
app.use(cookieParser()) // cookies 

app.use("/api/auth", authRoute)
app.use("/api/friends", messageRoute)

app.listen(PORT, () => {
    console.log("server started on port: " + PORT)
    connectDB()  // database connection 
})