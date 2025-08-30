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
        // console.log(`Received message from ${channel}: ${message}`);
        const parsedMessage = JSON.parse(message);
    });
}