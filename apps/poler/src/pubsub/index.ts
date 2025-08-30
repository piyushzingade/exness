import { createClient, type RedisClientType } from "redis";


export const publisherMessage: RedisClientType = createClient({
    url: "redis://localhost:6379"
});

export const subscriberMessage: RedisClientType = createClient({
    url: "redis://localhost:6379"
});

export async function initRedis() {
    await publisherMessage.connect();
    await subscriberMessage.connect();

    await subscriberMessage.pSubscribe("*", (channel, message) => {
        console.log(`Received message from ${channel}: ${message}`);
        const parsedMessage = JSON.parse(message);
    });
}