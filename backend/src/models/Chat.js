import mongoose from "mongoose"


const chatSchema = new mongoose.Schema({
    chatName: { type: String, trim: true }, // Only used for Group Chats
    isGroupChat: { type: Boolean, default: false },

    // Who is in this chat?
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // For Groups: Who created it/can add others?
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },


}, { timestamps: true });


const Chat = mongoose.model("Chat", chatSchema)

export default Chat;

