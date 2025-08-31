import express from "express";
import cors from "cors";
import { type User } from "@repo/types/index"
import { handleSignup } from "./routes/signup";
import { handleSignin } from "./routes/signin";
const app = express();

app.get("/", (req, res) => {
    res.send("API is running");

});

export const users: User[] = [];
app.use(express.json());
app.use(cors());

app.use("/api/v1/users", handleSignup)
app.use("/api/v1/users", handleSignin)




app.listen(3001, () => {
    console.log("Server is running on port 3001");
});