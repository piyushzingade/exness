import type { Trade, Trades } from "@repo/types/types";
import {
    TradeType,
    TradeStatus,
    AssetPriceUtils,
    QuantityUtils,
    UsdBalanceUtils,
} from "@repo/types/types";

export class TradeManager {
    private static instance: TradeManager;
    private userTrades: Map<string, Trades> = new Map();
    private tradeById: Map<string, Trade> = new Map();

    private constructor() { }

    public static getInstance(): TradeManager {
        if (!TradeManager.instance) {
            TradeManager.instance = new TradeManager();
        }
        return TradeManager.instance;
    }

    public openTrade(
        userId: string,
        symbol: string,
        type: TradeType,
        leverage: number,
        margin: number,
        openPrice: number,
        quantity: number,
        stopLoss?: number,
        takeProfit?: number,
    ): { success: boolean; tradeId?: string; error?: string } {
        const { BalanceManager } = require("./BalanceManager");
        const balanceManager = BalanceManager.getInstance();

        if (!balanceManager.hasEnoughMargin(userId, margin)) {
            return { success: false, error: "Insufficient margin" };
        }

        const tradeId = this.generateTradeId();
        const trade: Trade = {
            trade_id: tradeId,
            userId,
            symbol,
            type,
            leverage,
            margin,
            openPrice,
            quantity,
            createdAt: new Date(),
            trade_status: TradeStatus.OPEN,
            stopLoss,
            takeProfit,
        };

        if (!this.userTrades.has(userId)) {
            this.userTrades.set(userId, []);
        }

        this.userTrades.get(userId)!.push(trade);
        this.tradeById.set(tradeId, trade);

        balanceManager.reserveMargin(userId, margin);

        return { success: true, tradeId };
    }

    public closeTrade(
        tradeId: string,
        closePrice: number,
    ): { success: boolean; pnl?: number; error?: string } {
        const trade = this.tradeById.get(tradeId);
        if (!trade) {
            return { success: false, error: "Trade not found" };
        }

        if (trade.trade_status !== TradeStatus.OPEN) {
            return { success: false, error: "Trade already closed" };
        }

        const pnl = this.calculatePnl(trade, closePrice);
        trade.closePrice = closePrice;
        trade.pnl = pnl;
        trade.trade_status = TradeStatus.CLOSED;

        this.tradeById.set(tradeId, trade);
        this.updateUserTradesArray(trade.userId, trade);

        const { BalanceManager } = require("./BalanceManager");
        const balanceManager = BalanceManager.getInstance();
        balanceManager.settleTrade(trade.userId, trade.margin, pnl);

        return { success: true, pnl };
    }

    public liquidateTrade(
        tradeId: string,
        liquidationPrice: number,
    ): { success: boolean; pnl?: number; error?: string } {
        const trade = this.tradeById.get(tradeId);
        if (!trade) {
            return { success: false, error: "Trade not found" };
        }

        if (trade.trade_status !== TradeStatus.OPEN) {
            return { success: false, error: "Trade already closed" };
        }

        const pnl = this.calculatePnl(trade, liquidationPrice);

        // Get liquidation fee rate from LiquidationManager to avoid duplication
        const { LiquidationManager } = require("./LiquidationManager");
        const liquidationManager = LiquidationManager.getInstance();
        const liquidationFeeRate = liquidationManager.getLiquidationFeeRate();
        const liquidationFee = Math.round(trade.margin * liquidationFeeRate);
        const netPnl = pnl - liquidationFee;

        trade.closePrice = liquidationPrice;
        trade.pnl = netPnl;
        trade.trade_status = TradeStatus.CLOSED;

        this.tradeById.set(tradeId, trade);
        this.updateUserTradesArray(trade.userId, trade);

        const { BalanceManager } = require("./BalanceManager");
        const balanceManager = BalanceManager.getInstance();
        balanceManager.settleTrade(trade.userId, trade.margin, netPnl);

        return { success: true, pnl: netPnl };
    }

    public getUserTrades(userId: string): Trades {
        return this.userTrades.get(userId) || [];
    }

    public getOpenTrades(userId: string): Trades {
        const userTrades = this.userTrades.get(userId) || [];
        return userTrades.filter(
            (trade) => trade.trade_status === TradeStatus.OPEN,
        );
    }

    public getAllOpenTrades(): Trade[] {
        const allOpenTrades: Trade[] = [];
        for (const trades of this.userTrades.values()) {
            allOpenTrades.push(
                ...trades.filter((trade) => trade.trade_status === TradeStatus.OPEN),
            );
        }
        return allOpenTrades;
    }

    public getTradeById(tradeId: string): Trade | undefined {
        return this.tradeById.get(tradeId);
    }

    public deleteUserTrades(userId: string): boolean {
        const userTrades = this.userTrades.get(userId) || [];
        for (const trade of userTrades) {
            this.tradeById.delete(trade.trade_id);
        }
        this.userTrades.delete(userId);
        return true;
    }

    private calculatePnl(trade: Trade, currentPrice: number): number {
        // Convert to actual values
        const currentPriceActual = AssetPriceUtils.fromInteger(currentPrice);
        const openPriceActual = AssetPriceUtils.fromInteger(trade.openPrice);
        const quantityActual = QuantityUtils.fromInteger(trade.quantity);

        const priceChange =
            trade.type === TradeType.BUY
                ? currentPriceActual - openPriceActual
                : openPriceActual - currentPriceActual;

        // Calculate PnL in actual USD and convert back to integer format
        // Note: Leverage is already incorporated in the quantity calculation during trade opening
        // So we don't multiply by leverage again here to avoid double leverage application
        const pnlActual = priceChange * quantityActual;
        return UsdBalanceUtils.toInteger(pnlActual);
    }

    private updateUserTradesArray(userId: string, updatedTrade: Trade): void {
        const userTrades = this.userTrades.get(userId);
        if (!userTrades) return;

        const index = userTrades.findIndex(
            (trade) => trade.trade_id === updatedTrade.trade_id,
        );
        if (index !== -1) {
            userTrades[index] = updatedTrade;
            this.userTrades.set(userId, userTrades);
        }
    }

    private generateTradeId(): string {
        return `trade_${Bun.randomUUIDv7()}`;
    }

    /**
     * Get unrealized PnL for a trade - this should only be used for display purposes
     * Liquidation logic should be handled by LiquidationManager
     */
    public getUnrealizedPnL(trade: Trade, currentPrice: number): number {
        return this.calculatePnl(trade, currentPrice);
    }
}