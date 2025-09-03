
import type { Request, Response } from "express";
import { appManager } from "../../classes/AppManager";
import jwt from "jsonwebtoken";

export const handleSignUp = (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).send({ error: "Email is required" });
        }
        if (!password) {
            return res.status(400).send({ error: "Password is required" });
        }

        const result = appManager.signupUser(email, password);

        if (!result.success) {
            return res.status(400).send({ error: result.error });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).send({ message: "JWT_SECRET not set" });
        }

        const token = jwt.sign({ userId: result.userId }, process.env.JWT_SECRET);



        return res.status(201).json({
            userId: result.userId,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error while signing up" });
    }
};
