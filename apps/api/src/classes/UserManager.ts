import type { User } from "@repo/types/types";
import type { MyBalance } from "@repo/types/types";

export class UserManager {
    private static instance: UserManager;
    private users: Map<string, User> = new Map();
    private emailToUserId: Map<string, string> = new Map();

    private constructor() { }

    public static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    public signup(email: string, password: string): { success: boolean; userId?: string; error?: string } {
        if (this.emailToUserId.has(email)) {
            return { success: false, error: "Email already exists" };
        }

        const userId = this.generateUserId();
        const initialBalance: MyBalance = {
            usd: 5000,
            coins: {}
        };

        const user: User = {
            id: userId,
            email,
            password,
            balance: initialBalance,
            trades: []
        };

        this.users.set(userId, user);
        this.emailToUserId.set(email, userId);

        return { success: true, userId };
    }

    public signin(email: string, password: string): { success: boolean; userId?: string; user?: User; error?: string } {
        const userId = this.emailToUserId.get(email);
        if (!userId) {
            return { success: false, error: "User not found" };
        }

        const user = this.users.get(userId);
        if (!user || user.password !== password) {
            return { success: false, error: "Invalid credentials" };
        }

        return { success: true, userId, user };
    }

    public getUserById(userId: string): User | undefined {
        return this.users.get(userId);
    }

    public getUserByEmail(email: string): User | undefined {
        const userId = this.emailToUserId.get(email);
        return userId ? this.users.get(userId) : undefined;
    }

    public updateUserBalance(userId: string, balance: MyBalance): boolean {
        const user = this.users.get(userId);
        if (!user) return false;

        user.balance = balance;
        this.users.set(userId, user);
        return true;
    }

    public getAllUsers(): User[] {
        return Array.from(this.users.values());
    }

    public deleteUser(userId: string): boolean {
        const user = this.users.get(userId);
        if (!user) return false;

        this.emailToUserId.delete(user.email);
        this.users.delete(userId);
        return true;
    }

    private generateUserId(): string {
        return `user_${Bun.randomUUIDv7()}`;
    }
}