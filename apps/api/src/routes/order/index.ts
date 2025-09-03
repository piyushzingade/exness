
import {
    TradeType,
    UsdBalanceUtils,
    QuantityUtils,
    AssetPriceUtils,
} from "@repo/types/types";
import type { Response } from "express";
import { appManager } from "../../classes/AppManager";
import type { AuthenticatedRequest } from "../../middleware";
import { buyPrice, sellPrice } from "../..";

interface TradeRequest {
    symbol: string;
    type: "buy" | "sell";
    margin?: number;
    quantity?: number;
    leverage: number;
}

interface CloseTradeRequest {
    trade_id: string;
}

export const handleOpenTrade = (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId as string;
    if (!userId) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const user = appManager.userManager.getUserById(userId);
    if (!user) {
        return res.status(411).json({ message: "User not found" });
    }

    const { symbol, type, margin, quantity, leverage } = req.body as TradeRequest;

    if (!symbol || !type || !leverage) {
        return res.status(411).json({ message: "Incorrect symbol" });
    }

    if (type !== "buy" && type !== "sell") {
        return res.status(411).json({ message: "Incorrect type" });
    }

    if (leverage <= 0 || ![5, 10, 20, 50, 100].includes(leverage)) {
        return res.status(411).json({ message: "Incorrect leverage" });
    }

    if (!margin && !quantity) {
        return res.status(411).json({ message: "Incorrect margin or quantity" });
    }

    if (margin && margin <= 0) {
        return res.status(411).json({ message: "Incorrect margin" });
    }

    if (quantity && quantity <= 0) {
        return res.status(411).json({ message: "Incorrect q" });
    }

    const currentPrice = type === "buy" ? buyPrice : sellPrice;

    let finalQuantity: number;
    let finalMargin: number;

    if (quantity) {
        const quantityInteger = QuantityUtils.toInteger(quantity);
        const positionValue = AssetPriceUtils.fromInteger(currentPrice) * quantity;
        finalMargin = UsdBalanceUtils.toInteger(positionValue);
        finalQuantity = quantityInteger;
    } else if (margin) {
        const totalExposure = margin * leverage;
        const calculatedQuantity = totalExposure / AssetPriceUtils.fromInteger(currentPrice);
        finalQuantity = QuantityUtils.toInteger(calculatedQuantity);
        finalMargin = UsdBalanceUtils.toInteger(margin);
    } else {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const tradeType = type === "buy" ? TradeType.BUY : TradeType.SELL;

    const result = appManager.tradeManager.openTrade(
        userId,
        symbol,
        tradeType,
        leverage,
        finalMargin,
        currentPrice,
        finalQuantity
    );

    if (!result.success) {
        return res.status(411).json({ message: result.error });
    }

    return res.status(200).json({
        orderId: result.tradeId,
    });
};

export const handleCloseTrade = (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId as string;
    if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
    }

    const user = appManager.userManager.getUserById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const { trade_id } = req.body as CloseTradeRequest;

    if (!trade_id) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const trade = appManager.tradeManager.getTradeById(trade_id);
    if (!trade) {
        return res.status(404).json({ message: "Trade not found" });
    }

    if (trade.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
    }

    if (trade.trade_status !== "OPEN") {
        return res.status(400).json({ message: "Trade is not open" });
    }

    const closePrice = trade.type === "BUY" ? sellPrice : buyPrice;

    if (!closePrice || closePrice <= 0) {
        return res.status(500).json({ message: "Invalid market price" });
    }

    const result = appManager.tradeManager.closeTrade(trade_id, closePrice);

    if (!result.success) {
        return res.status(400).json({ message: result.error });
    }

    return res.status(200).json({
        message: "Trade closed successfully",
        pnl: result.pnl,
        trade_id: trade_id,
    });
};