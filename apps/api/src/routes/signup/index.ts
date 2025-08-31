import { Router } from "express";
import { users } from "../..";
import type { User } from "@repo/types/index";


export const handleSignup = Router();


handleSignup.post("/signup", (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = users.find(u => u.email === email);
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }

        const newUser: User = {
            id: Bun.randomUUIDv7(),
            email,
            password,
            balance: 1000
        }

        users.push(newUser);



        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(403).json({ message: "My Error" });
    }
})
