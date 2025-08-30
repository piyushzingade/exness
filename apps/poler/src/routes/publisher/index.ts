import { getAveragePrice, getBuyPrice, getSellPrice, type binanceWebSockerResponse } from "@repo/types/index";
import { publisherMessage } from "../../pubsub";
import { pushToDB } from "../pushToDb";

export const getPublisherData = async (data: binanceWebSockerResponse) => {
    // Implementation for processing publisher data

    await publisherMessage.publish("binanceWebSocket",
        JSON.stringify({
            buy: getBuyPrice(parseFloat(data.data.p)),
            sell: getSellPrice(parseFloat(data.data.p)),
        })
    )

    await pushToDB(data);
}
