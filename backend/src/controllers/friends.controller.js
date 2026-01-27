import User from "../models/User.js"
import Chat from "../models/Chat.js"
import FriendRequest from "../models/FriendRequest.js"


export const getAllContacts = async (req, res) => {


    try {
        // get the loggedin user
        const loggedInUser = req.user._id

        const [friends, groups] = await Promise.all([
            // get the friends from the friends array in User Object and get the friends Object
            User.findById(loggedInUser).populate("friends", "fullName profilePic"),
            // find the groups using the chat model for only isgroupchat == true and the users inside that chats
            Chat.find({
                isGroupChat: true,
                users: { $elemMatch: { $eq: loggedInUser } },
            }).populate("users", "-password").populate("groupAdmin", "-password") // getting the users and group admin
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
        // get the receiver ID whom we want to send the request
        const { receiverID } = req.body

        if (!receiverID) {
            return res.status(400).json({ message: "Invalid Request" })
        }

        if (receiverID == req.user._id) return res.status(400).json({ message: "Can't send friend request to self" })

        // check if already friend
        const alreadyFriends = await User.findOne({
            _id: req.user._id,
            friends: { $in: [receiverID] }
        });
        // if its already friend then return 
        if (alreadyFriends) {
            return res.status(400).send({ message: "You are already friends with this user." });
        }
        // check for the existing request to prevent the sending again
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: req.user._id, receiver: receiverID },
                { sender: receiverID, receiver: req.user._id }
            ]
        })
        // if the request is already exist then return 
        if (existingRequest) {
            return res.status(400).json({ message: "Request already sent. Please wait to accept from the user" })
        }
        // create request with the sender is user who is sending and receiver is the receiveID from the frontend
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
        // get all the friend request whose receiver is the user
        const requests = await FriendRequest.find({
            receiver: userId,
            status: "pending"
        }).populate("sender", "fullName profilePic") // send only sender name and the profile picture for frontend

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

        // find the request using request ID of the FriendRequest 
        const request = await FriendRequest.findById({
            _id: requestID
        }).populate("sender", "fullName").populate("receiver", "fullName") // get only sender and the receiver

        // if not request or if its accepted already then return 
        if (!request || request.status !== "pending") {
            return res.status(404).json({ message: "Friend request not found" })
        }
        // if there is request pending update the status field in the request object
        request.status = "accepted"
        await request.save() // update the request object status as accepted

        // add the receiver friend to the sender in friends array in the user object 
        await User.findByIdAndUpdate(request.sender._id, { $addToSet: { friends: request.receiver._id } })
        // add the sender friend to the receiver in friends array in the user object
        await User.findByIdAndUpdate(request.receiver._id, { $addToSet: { friends: request.sender._id } })

        // socket io implementaion for notifying user


        res.status(200).json({ message: "Friend request accepted" })


    } catch (error) {
        console.log("Error in acceptFriendRequest controller", error)
        res.status(501).json({ message: " Internal server error" })

    }

}

export const createGroup = async (req, res) => {

    try {
        const { users, groupName } = req.body
        if (!groupName) return res.status(400).json({ message: "Please provide user name" })
        console.log(users)
        if (users.length < 2) {
            return res.status(400).json({ message: " More than two users required to create group" })
        }

        users.push(req.user)

        const group = await Chat.create({
            chatName: groupName,
            isGroupChat: true,
            users: users,
            groupAdmin: req.user
        })

        const fullGroupChat = await Chat.findOne({ _id: group._id }).populate("users", "-password -friends").populate("groupAdmin", "-password -friends")

        res.status(201).json({ fullGroupChat })
    } catch (error) {
        console.log("error in create group controller", error)
        res.status(501).json({ message: "Internal server error" })

    }
}