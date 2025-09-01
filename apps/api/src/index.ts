import express from "express";
import cors from "cors";
import { type User } from "@repo/types/index"
import { handleSignup } from "./routes/signup";
import { handleSignin } from "./routes/signin";
import { handleCandle } from "./routes/candle";
const app = express();

app.get("/", (req, res) => {
    res.send("API is running");

});

export const users: User[] = [];
app.use(express.json());
app.use(cors());

app.use("/api/v1/users", handleSignup)
app.use("/api/v1/users", handleSignin)
app.use("/api/v1/candle", handleCandle)


app.listen(3001, () => {
    console.log("Server is running on port 3001");
});