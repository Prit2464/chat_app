import { genrateToken } from "../lib/utils.js";
import User from "../models/User.js"
import bcrypt from "bcryptjs";
import claudinary from "../lib/claudinary.js"

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
        // save the user in database and create a token with generate token method and send status 201 and user data 
        if (newUser) {
            await newUser.save()
            genrateToken(newUser._id, res)
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

    if (!email || !password) return res.status(400).json({ message: "Email and password required" })
    try {
        const user = await User.findOne({ email })

        if (!user) return res.status(400).json({ message: "Invalid credentilas" })

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

export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        if (!profilePic) return res.status(400).json({ message: "Please provide profile picture" })

        const userID = req.user._id

        const uploadResponse = await claudinary.uploader.upload(profilePic)

        const updatedUser = await User.findByIdAndUpdate(userID,
            { profilePic: uploadResponse.secure_url },
            { new: true })

        res.status(200).json(updatedUser)
    } catch (error) {
        console.log("Error in updateProfile controller", error)
        return res.status(500).json({ message: "Internal server error" })
    }

}