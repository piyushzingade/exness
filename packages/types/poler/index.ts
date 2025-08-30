export type binanceWebSockerResponse = {
    stream: string;
    data: Data;
};

export type Data = {
    e: string;
    E: number;
    s: string;
    t: number;
    p: string;
    q: string;
    T: number;
    m: boolean;
    M: boolean;
};