import type { MyBalance } from "@repo/types/types";
import { BalanceType } from "@repo/types/types";

export class BalanceManager {
    private static instance: BalanceManager;
    private userBalances: Map<string, MyBalance> = new Map();

    private constructor() { }

    public static getInstance(): BalanceManager {
        if (!BalanceManager.instance) {
            BalanceManager.instance = new BalanceManager();
        }
        return BalanceManager.instance;
    }

    public initializeBalance(userId: string, initialBalance: MyBalance): void {
        this.userBalances.set(userId, { ...initialBalance });
    }

    public getBalance(userId: string): MyBalance | undefined {
        return this.userBalances.get(userId);
    }

    public updateUsdBalance(userId: string, amount: number): boolean {
        const balance = this.userBalances.get(userId);
        if (!balance) return false;

        balance.usd += amount;
        this.userBalances.set(userId, balance);
        return true;
    }

    public hasEnoughMargin(userId: string, requiredMargin: number): boolean {
        const balance = this.userBalances.get(userId);
        if (!balance) return false;
        return balance.usd >= requiredMargin;
    }

    public reserveMargin(userId: string, margin: number): boolean {
        const balance = this.userBalances.get(userId);
        if (!balance || balance.usd < margin) return false;

        balance.usd -= margin;
        this.userBalances.set(userId, balance);
        return true;
    }

    public settleTrade(userId: string, margin: number, pnl: number): boolean {
        const balance = this.userBalances.get(userId);
        if (!balance) return false;

        balance.usd += margin + pnl;
        this.userBalances.set(userId, balance);
        return true;
    }

    public updateCoinBalance(
        userId: string,
        coin: string,
        quantity: string,
        type: BalanceType,
    ): boolean {
        const balance = this.userBalances.get(userId);
        if (!balance) return false;

        if (!balance.coins[coin]) {
            balance.coins[coin] = { quantity: "0", type };
        }

        const currentQuantity = Number.parseFloat(balance.coins[coin].quantity);
        const newQuantity =
            type === BalanceType.BUY
                ? currentQuantity + Number.parseFloat(quantity)
                : currentQuantity - Number.parseFloat(quantity);

        balance.coins[coin] = {
            quantity: newQuantity.toFixed(8),
            type: newQuantity >= 0 ? BalanceType.BUY : BalanceType.SELL,
        };

        this.userBalances.set(userId, balance);
        return true;
    }

    public getCoinBalance(
        userId: string,
        coin: string,
    ): { quantity: string; type: BalanceType } | undefined {
        const balance = this.userBalances.get(userId);
        if (!balance) return undefined;
        return balance.coins[coin];
    }

    public getAllBalances(): Array<{ userId: string; balance: MyBalance }> {
        const result: Array<{ userId: string; balance: MyBalance }> = [];
        for (const [userId, balance] of this.userBalances.entries()) {
            result.push({ userId, balance });
        }
        return result;
    }

    public deleteUserBalance(userId: string): boolean {
        return this.userBalances.delete(userId);
    }

    public getTotalUsdValue(userId: string): number {
        const balance = this.userBalances.get(userId);
        if (!balance) return 0;
        return balance.usd;
    }

    public transferUsd(
        fromUserId: string,
        toUserId: string,
        amount: number,
    ): boolean {
        const fromBalance = this.userBalances.get(fromUserId);
        const toBalance = this.userBalances.get(toUserId);

        if (!fromBalance || !toBalance || fromBalance.usd < amount) {
            return false;
        }

        fromBalance.usd -= amount;
        toBalance.usd += amount;

        this.userBalances.set(fromUserId, fromBalance);
        this.userBalances.set(toUserId, toBalance);

        return true;
    }
}