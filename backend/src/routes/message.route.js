import express from "express";
import { acceptFriendRequest, getAllContacts, getFriendRequests, sendFriendRequest } from "../controllers/message.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";


const router = express.Router()

router.use(protectedRoute)

router.get("/contacts", getAllContacts)
router.post("/sendFriendRequest", sendFriendRequest)
router.post("/acceptFriendRequest", acceptFriendRequest)
router.get("/getFriendRequests", getFriendRequests)


// router.get("/contacts" , getAllContacts)
// router.get("/contacts" , getAllContacts)
// router.get("/contacts" , getAllContacts)

export default router