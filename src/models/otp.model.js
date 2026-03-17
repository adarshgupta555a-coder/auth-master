import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        require: [true,"user email is required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        require:[true, "user id is required"]
    },
    otpHash:{
        type: String,
        require:[true, "user otp is required"]
    }
},{timestamps:true});

const otpModel = mongoose.model("otp", otpSchema);

export default otpModel;