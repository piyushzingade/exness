
import { getBuyPrice, getSellPrice, type binanceWebSockerResponse } from "@repo/types/types";
import { publisherMessage } from "../../redis-pubsub";
import { pushToDB } from "../pushToDb/pushToDB";

export const getPublisherData = async (data: binanceWebSockerResponse) => {
    // console.log("helping to get to redis")
    await publisherMessage.publish("priceUpdates",
        JSON.stringify({
            buy: getBuyPrice(Number.parseFloat(data.data.p)),
            sell: getSellPrice(Number.parseFloat(data.data.p)),
        })
    )
    // console.log("rere")
    await pushToDB(data);
    // console.log("full")
}
