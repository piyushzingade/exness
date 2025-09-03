
import { TradeStatus } from "@repo/types/types";
import type { Response } from "express";
import { appManager } from "../../classes/AppManager";
import type { AuthenticatedRequest } from "../../middleware";

export const openOrderOfUser = (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId as string;
    if (!userId) {
        return res.status(400).send({ error: "Invalid or missing userId" });
    }

    const openTrades = appManager.tradeManager.getOpenTrades(userId);

    return res.status(200).json({ trades: openTrades });
};

export const closeOrderOfUser = (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId as string;
    if (!userId) {
        return res.status(400).send({ error: "Invalid or missing userId" });
    }

    const allTrades = appManager.tradeManager.getUserTrades(userId);
    const closedTrades = allTrades.filter(trade => trade.trade_status === TradeStatus.CLOSED);

    return res.status(200).json({ trades: closedTrades });
};

export const allOrderOfUser = (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId as string;
    if (!userId) {
        return res.status(400).send({ error: "Invalid or missing userId" });
    }

    const trades = appManager.tradeManager.getUserTrades(userId);
    return res.status(200).json({ trades: trades });
};