

export type User = {
    id: string;
    email: string;
    password: string;
    balance: number;
    trades?: Trade[];
};

export type Trade = {
    id: string;
    userId: string;
    symbol: string;
    price: number;
    quantity: number;
    side: "buy" | "sell";
};
