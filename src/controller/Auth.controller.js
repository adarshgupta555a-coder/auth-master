import jwt from "jsonwebtoken";
import userModel from "../models/users.model.js";
import bcrypt from "bcrypt";
import { configDotenv } from "dotenv";
import sendMail from "../services/sendMail.service.js";
import sessionModel from "../models/session.model.js";
import otpModel from "../models/otp.model.js"
import { generateOtp, generateOTPHTML } from "../utils/generateOtp.js";
import crypto from "crypto";

configDotenv()

export const register = async (req, res) => {
    try {
        const { username, email, age, password } = req.body;
        const usercheck = await userModel.findOne({ email: email });
        if (usercheck) {
            return res.status(400).send("email is already exists!");
        }

        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            username,
            email,
            age,
            password: passwordHash,
        })

        const otpGenerator = generateOtp();
        const OTPHTML = generateOTPHTML(otpGenerator)

        const otpHash = crypto.createHash("sha256").update(String(otpGenerator)).digest("hex");

        await otpModel.create({
            email: user.email,
            user: user._id,
            otpHash: otpHash
        })

        await sendMail(user.email, "OTP Verification Code", "Your Verification Code", OTPHTML)


        res.status(200).send({ user: user });

    } catch (error) {
        console.log(error)
        res.status(500).send("something went wrong!")
    }
}

export const getMe = async (req, res) => {
    try {
        const token = req.headers?.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).send("token is not found")
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in .env");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded)

        const usercheck = await userModel.findById(decoded.id);

        res.status(200).send(usercheck);


    } catch (error) {
        console.log(error)
        res.status(400).send("something went wrong!")
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userEmail = await userModel.findOne({ email: email });

        if (!userEmail) {
            return res.status(400).send({ message: "user email and password are incorrect" })
        }

        const matchPassword = await bcrypt.compare(password, userEmail.password);

        if (!matchPassword) {
            return res.status(400).send({ message: "user email and password are incorrect" })
        }

        if (!userEmail.isVerified) {
            return res.status(400).send({ message: "user is not verified" })
        }


        const RefreshToken = jwt.sign({ id: userEmail._id }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })


        const hashRefreshToken = crypto.createHash("sha256").update(RefreshToken).digest("hex");
        const session = await sessionModel.create({
            user: userEmail._id,
            refreshTokenHash: hashRefreshToken,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        })


        const AccessToken = jwt.sign({ id: userEmail._id, session_id: session._id }, process.env.JWT_SECRET, {
            expiresIn: "15m"
        })


        res.cookie("RefreshToken", RefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).send({ user: userEmail.username, AccessToken })


    }
    catch (error) {
        console.log(error)
        res.status(500).send({ message: "Server error" })
    }

}

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.RefreshToken;
        if (!token) {
            return res.status(400).send({ message: "token is not defined" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
        const session = await sessionModel.findOne({ refreshTokenHash, revoked: false });

        if (!session) {
            return res.status(400).send({ message: "user refreshtoken is invalid." })
        }

        const AccessToken = jwt.sign({ id: decoded.id, sessionId: session._id}, process.env.JWT_SECRET, { expiresIn: "15m" });

        const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        const newrefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        session.refreshTokenHash = newrefreshTokenHash;
        await session.save();


        res.cookie("RefreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.status(200).send({ message: "Access token refreshed", AccessToken })

    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Server error" })
    }
}


export const verifyOtp = async (req, res) => {
    try {
        const { otp, email } = req.body;

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        const otpCheck = await otpModel.findOne({ email, otpHash })

        if (!otpCheck) {
            return res.status(400).send({ message: "otp is invalid." })
        }


        const userUpdate = await userModel.findByIdAndUpdate(otpCheck.user, { isVerified: true });

        await otpModel.deleteMany({
            user: otpCheck.user
        })

        res.status(200).send({ message: "user is verified", user: userUpdate })

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "sopmething went wrong!" })
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.cookies.RefreshToken;
        if (!token) {
            return res.status(400).send({ message: "token is not found" })
        }


        const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex")
        const session = await sessionModel.findOne({ refreshTokenHash, revoked: false });
      

        if (!session) {
            return res.status(400).send({ message: "session is not found" })
        }

        session.revoked = true;
        await session.save();

        res.clearCookie("RefreshToken")

        res.status(200).send({ message: "logged out successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "something went wrong!" })
    }
}


export const logoutAll = async (req, res) => {
    try {
        const token = req.cookies?.RefreshToken;
        if (!token) {
            return res.status(400).send({ message: "token is not found!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        await sessionModel.updateMany({
            user: decoded.id,
            revoked: false
        }, {
            revoked: true
        })

        res.clearCookie("RefreshToken")

        res.status(200).send({ message: "logged out successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "something went wrong" })
    }
}

