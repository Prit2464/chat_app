import User from "../models/User.js"
import Chat from "../models/Chat.js"
import FriendRequest from "../models/FriendRequest.js"


export const getAllContacts = async (req, res) => {
    try {
        const loggedInUser = req.user._id

        const [friends, groups] = await Promise.all([
            User.findById(loggedInUser).populate("friends", "fullName profilePic"),

            Chat.find({
                isGroupChat: true,
                users: { $elemMatch: { $eq: loggedInUser } },
            }).populate("users", "-password").populate("groupAdmin", "-password")
        ])


        if (!friends) {
            return res.status(404).json({ message: "You dont have any friends" })
        }

        res.status(200).json({
            friends: friends.friends,
            groups: groups
        })

    } catch (error) {
        console.log("error in get all contacts controller ", error)
        res.status(501).json({ message: "Internal server error" })
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const { receiverID } = req.body

        if (!receiverID) {
            return res.status(400).json({ message: "Invalid Request" })
        }
        if (receiverID == req.user._id) return res.status(400).json({ message: "Can't send friend request to self" })



        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverID },
                { sender: receiverID, receiver: req.user._id }
            ]
        })

        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent. Please wait to accept from the user" })
        }

        const request = await FriendRequest.create({
            sender: req.user._id,
            receiver: receiverID
        })
        
        // todo : implement the real time friend requst send with socket logic

        res.status(201).json({ message: "Sent the friend request", request })

    } catch (error) {
        console.log("error in get all contacts controller ", error)
        res.staus(501).json({ message: "Internal server error" })
    }

}

export const getFriendRequests = async (req, res) => {

    try {
        const userId = req.user._id
        if (!userId) return res.status(400).json({ message: "Please Login" })
        console.log(userId)
        const requests = await FriendRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "fullName profilePic")

        if (!requests) return res.status(200).json({ message: " You dont have any friend requests" })
        console.log(requests)

        res.status(200).json({ requests })

    } catch (error) {
        console.log("Error in getFriendRequests controller", error)
        res.status(501).json({ message: " Internal server error" })
    }
}

export const acceptFriendRequest = async (req, res) => {

    try {
        const { requestID } = req.body

        const request = await FriendRequest.findById({
            _id: requestID
        }).populate("sender", "fullName").populate("receiver", "fullName")

        if (!request || request.status !== "pending") {
            return res.status(404).json({ message: "Friend request not found" })
        }
        request.status = "accepted"
        await request.save()

        await User.findByIdAndUpdate(request.sender._id, { $addToSet: { friends: request.receiver._id } })
        await User.findByIdAndUpdate(request.receiver._id, { $addToSet: { friends: request.sender._id } })

        // socket io implementaion for notifying user


        res.status(200).json({ message: "Friend request accpted" })


    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error)
        res.status(501).json({ message: " Internal server error" })

    }

}