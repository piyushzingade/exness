import express from "express";
import cors from "cors";
import type { User } from "@repo/types/types";
import { getCandle, handleCandle } from "./routes/candle";
import { authMiddleware } from "./middleware";
import { handleCloseTrade, handleOpenTrade } from "./routes/order";
import { allOrderOfUser, closeOrderOfUser, openOrderOfUser } from "./routes/orders";
import { handleBalance } from "./routes/balance";
import { handleSignIn } from "./routes/signin";
import { handleSignUp } from "./routes/signup";
const app = express();

app.get("/", (req, res) => {
    res.send("API is running");

});


export let buyPrice = 0;

export let sellPrice = 0;

export const users: User[] = [];
app.use(express.json());
app.use(cors());

app.use("/api/v1/user/signup", handleSignUp)
app.use("/api/v1/user/signin", handleSignIn)
app.use("/api/v1/candles", getCandle)
app.post("/trade", authMiddleware, handleOpenTrade)
app.post("/trade/close", authMiddleware, handleCloseTrade)
app.get("/trades/open", authMiddleware, openOrderOfUser)
app.get("/trades/close", authMiddleware, closeOrderOfUser)
app.get("/trades", authMiddleware, allOrderOfUser)
app.get("/user/balance", authMiddleware, handleBalance)



app.listen(3001, () => {
    console.log("Server is running on port 3001");
});