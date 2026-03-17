import express from "express";
import { configDotenv } from "dotenv";
configDotenv()
import AuthRouter from "./routes/users.routes.js"
import conn from "./config/mongoose.config.js";
import cookieParser from "cookie-parser";
conn()
const app = express();

app.use(express.json())
app.use(cookieParser());

app.use("/api/users",AuthRouter)

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`server is running on ${port}`)
})