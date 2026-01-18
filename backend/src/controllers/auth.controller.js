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

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        })

        if (newUser) {
            genrateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            })

        } else {

            res.status(400).json({ message: "Invalid user data" })
        }
    } catch (error) {
        console.log("Error in signup controller", error)
        res.status(500).json({ message: "Internal server error" })
    }

}



export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: "Invalid credentilas" })
        console.log(user.password)
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentilas" })

        genrateToken(user._id, res)
        res.status(201).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.error("Error in login Controller", error)
        return res.status(500).json({ message: "Internal server  error" })
    }

}
export const logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 })
    res.status(200).json({ message: "Logout successfully" })
}