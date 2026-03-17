import express from "express";
import { getMe, login, logout, logoutAll, refreshToken, register, verifyOtp } from "../controller/Auth.controller.js";
const router = express.Router();

router.post("/register",register);
router.post("/verify",verifyOtp);
router.post("/login",login);

router.get("/getme",getMe);
router.get("/refresh-token",refreshToken);
router.get("/logout",logout);
router.get("/logoutAll",logoutAll);


export default router;