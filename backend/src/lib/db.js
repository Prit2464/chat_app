import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()


export const connectDB = async () => {
    try {

        const { MONGODB_URI } = process.env
        if (!MONGODB_URI) throw new Error("MOGO URI is not set")
        const conn = await mongoose.connect(MONGODB_URI)
        console.log("Host ", conn.connection.host)
    } catch (error) {
        console.error("mongodb connection failed: ", error.message)
        process.exit(1) // In case of failure 1 or success 0
    }
}