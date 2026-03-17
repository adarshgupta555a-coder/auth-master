import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, require: true },
    email: { type: String, require: true, unique: true, lowercase: true },
    password:{type: String, require: true},
    age: { type: Number, min: 18, max: 65 },
    isVerified: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("user", userSchema);

export default User;