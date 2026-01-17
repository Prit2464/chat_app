import { genrateToken } from "../lib/utils.js";
import User from "../models/User.js"
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body
    try {
        //  check all fields are provided
        if (!email || !password || !fullName) {
            return res.status(400).json({ message: "Please provide all the details" })
        }
        // check the password length
        if (password.length < 6) {
            return res.status(400).json({ message: "password must be at least 6 charaters" })
        }
        // check email is valid or not with regex
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "invalid email format" })
        }

        // Check if the user is already exist
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "Email already exist" })
        }

        // hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // create the new user with user model
        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        })

        if (newUser) {
            // save the created user into database
            const savedUser = await newUser.save()

            // generate token and send it back to client
            genrateToken(newUser._id, res)


            // send the user deatils
            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            })
            // todo send welcom email

        } else {

            res.status(400).json({ message: "Invalid user data" })
        }
    } catch (error) {
        console.log("Error in signup controller", error)
        res.status(500).json({ message: "Internal server error" })
    }

}



export const login = async (req, res) => {
    res.send("login endpoint")
}
export const logout = async (req, res) => {
    res.send("logout endpoint")
}