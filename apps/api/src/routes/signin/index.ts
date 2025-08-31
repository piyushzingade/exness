import { Router } from "express";
import { users } from "../..";


export const handleSignin = Router();

handleSignin.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid password" });
        }

        res.status(200).json({ message: "Signin successful" });
    } catch (error) {
        console.error("Error signing in user:", error);
        res.status(403).json({ message: "My Error" });
    }
});
