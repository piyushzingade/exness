import { createClient, type RedisClientType } from "redis";
let isConnected = false;

export const publisherMessage: RedisClientType = createClient({
    url: process.env.REDIS_URL
});

export const subscriberMessage: RedisClientType = createClient({
    url: process.env.REDIS_URL
});

export async function initRedis() {
    await publisherMessage.connect();
    await subscriberMessage.connect();
    isConnected = true;

    await subscriberMessage.pSubscribe("*", (channel, message) => {
        let parsedMessage: any;
        try {
            parsedMessage = JSON.parse(message);
        } catch {
            parsedMessage = message; // fallback if it's not JSON
        }

        // console.log(`Received from ${channel}:`, parsedMessage);
    });
}