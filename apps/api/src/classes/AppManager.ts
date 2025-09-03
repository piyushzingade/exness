import { UserManager } from "./UserManager";
import { TradeManager } from "./TradeManager";
import { BalanceManager } from "./BalanceManager";

export class AppManager {
    private static instance: AppManager;
    public userManager: UserManager;
    public tradeManager: TradeManager;
    public balanceManager: BalanceManager;
    // public liquidationManager: LiquidationManager;

    private constructor() {
        this.balanceManager = BalanceManager.getInstance();
        this.userManager = UserManager.getInstance();
        this.tradeManager = TradeManager.getInstance();
        // this.liquidationManager = LiquidationManager.getInstance();
    }

    public static getInstance(): AppManager {
        if (!AppManager.instance) {
            AppManager.instance = new AppManager();
        }
        return AppManager.instance;
    }

    // public initialize(): void {
    //     this.liquidationManager.startMonitoring();
    //     console.log("App Manager initialized with all systems");
    // }

    // public shutdown(): void {
    //     this.liquidationManager.stopMonitoring();
    //     console.log("App Manager shutdown complete");
    // }

    public signupUser(email: string, password: string): { success: boolean; userId?: string; error?: string } {
        const result = this.userManager.signup(email, password);
        if (result.success && result.userId) {
            const initialBalance = { usd: 1000000, coins: {} };
            this.balanceManager.initializeBalance(result.userId, initialBalance);
        }
        return result;
    }

    public deleteUser(userId: string): boolean {
        const success = this.userManager.deleteUser(userId);
        if (success) {
            this.tradeManager.deleteUserTrades(userId);
            this.balanceManager.deleteUserBalance(userId);
        }
        return success;
    }
}

export const appManager = AppManager.getInstance();