import { configDotenv } from "dotenv";
configDotenv();

if (!process.env.MONGOOSE_URL) {
    throw new Error("mongoose url is not defined")
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined")
}


if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is not defined")
}


if (!process.env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined")
}

if (!process.env.GOOGLE_USER) {
    throw new Error("GOOGLE_USER is not defined")
}


export const config = {
    MONGOOSE_URL: process.env.MONGOOSE_URL,
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_USER: process.env.GOOGLE_USER
}