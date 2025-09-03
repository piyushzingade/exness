import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.token as string;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET not set" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
