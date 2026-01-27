import express from "express";
import { acceptFriendRequest, createGroup, getAllContacts, getFriendRequests, sendFriendRequest } from "../controllers/friends.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";


const router = express.Router()

router.use(protectedRoute)

router.get("/contacts", getAllContacts) // get all the contacts along with the groups
router.post("/sendFriendRequest", sendFriendRequest) // send friend request
router.post("/acceptFriendRequest", acceptFriendRequest) // accept friend request
router.get("/getFriendRequests", getFriendRequests) // get all friend request


router.post("/createGroup", createGroup) // creating group






export default router