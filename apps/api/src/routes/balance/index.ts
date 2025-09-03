import { appManager } from "../../classes/AppManager";
import { TradeType, AssetPriceUtils, QuantityUtils, UsdBalanceUtils } from "@repo/types/types";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware";
import { buyPrice, sellPrice } from "../..";

export const handleBalance = (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId as string;

    if (!userId) {
        return res.status(400).send({ error: "Invalid or missing userId" });
    }

    const balance = appManager.balanceManager.getBalance(userId);
    if (!balance) {
        return res.status(404).send({ error: "User balance not found" });
    }

    const openTrades = appManager.tradeManager.getOpenTrades(userId);

    if (openTrades.length === 0) {
        const cashBalance = UsdBalanceUtils.fromInteger(balance.usd);
        return res.status(200).json({
            usd_balance: cashBalance,
            unrealized_pnl: 0,
            effective_balance: cashBalance,
            open_trades_count: 0
        });
    }

    let totalUnrealizedPnL = 0;

    openTrades.forEach(trade => {
        if (!buyPrice || !sellPrice) {
            return;
        }

        const currentPrice = trade.type === TradeType.BUY ? sellPrice : buyPrice;

        const openPrice = AssetPriceUtils.fromInteger(trade.openPrice);
        const currentMarketPrice = AssetPriceUtils.fromInteger(currentPrice);
        const quantity = QuantityUtils.fromInteger(trade.quantity);

        let tradePnL = 0;
        if (trade.type === TradeType.BUY) {
            tradePnL = (currentMarketPrice - openPrice) * quantity;
        } else {
            tradePnL = (openPrice - currentMarketPrice) * quantity;
        }

        // Note: Leverage is already incorporated in the quantity calculation during trade opening
        // So we don't multiply by leverage again here to avoid double leverage application

        totalUnrealizedPnL += tradePnL;
    });

    const cashBalance = UsdBalanceUtils.fromInteger(balance.usd);
    const effectiveBalance = cashBalance + totalUnrealizedPnL;

    return res.status(200).json({
        usd_balance: cashBalance,
        unrealized_pnl: totalUnrealizedPnL,
        effective_balance: effectiveBalance,
        open_trades_count: openTrades.length
    });
};