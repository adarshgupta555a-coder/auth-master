import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require: [true,"user is required"]
    },
    refreshTokenHash: {
        type: String,
        require: [true, "refresh token is required"]
    },
    ip:{
        type:String,
        require:true
    },
    userAgent: {
        type: String,
        require: true
    },
    revoked: {
        type: Boolean,
        default: false
    }
})

const sessionModel = mongoose.model("session", sessionSchema);

export default sessionModel;