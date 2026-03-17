import nodemailer from "nodemailer";
import transporter from "./email.service.js";
import { config } from "../config/config.js";

const sendMail = async (to,subject,text, html) => {
    try {
        const info = transporter.sendMail({
            from: config.GOOGLE_USER,
            to,
            subject,
            text,
            html
        })
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

export default sendMail;