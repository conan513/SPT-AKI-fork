"use strict";

class TradeController
{
    buyItem(pmcData, body, sessionID)
    {
        if (body.tid === "579dc571d53a0658a154fbec")
        {
            body.tid = "ragfair";
        }

        let callback = () =>
        {
            if (!itm_hf.payMoney(pmcData, body, sessionID))
            {
                logger.logError("no money found");
                throw "Transaction failed";
            }

            logger.logSuccess("Bought item: " + body.item_id);
        };

        const newReq = {
            "items": [{
                "item_id": body.item_id,
                "count": body.count,
            }],
            "tid": body.tid
        };

        return inventory_f.inventoryController.addItem(pmcData, newReq, item_f.itemServer.getOutput(), sessionID, callback);
    }

    // Selling item to trader
    sellItem(pmcData, body, sessionID)
    {
        let money = 0;
        let prices = trader_f.traderServer.getPurchasesData(body.tid, sessionID);
        let output = item_f.itemServer.getOutput();

        for (let sellItem of body.items)
        {
            for (let item of pmcData.Inventory.items)
            {
                // profile inventory, look into it if item exist
                let isThereSpace = sellItem.id.search(" ");
                let checkID = sellItem.id;

                if (isThereSpace !== -1)
                {
                    checkID = checkID.substr(0, isThereSpace);
                }

                // item found
                if (item._id === checkID)
                {
                    logger.logInfo("Selling: " + checkID);

                    // remove item
                    insurance_f.insuranceServer.remove(pmcData, checkID, sessionID);
                    output = inventory_f.inventoryController.removeItem(pmcData, checkID, output, sessionID);

                    // add money to return to the player
                    if (output !== "")
                    {
                        money += parseInt(prices[item._id][0][0].count);
                        break;
                    }

                    return "";
                }
            }
        }

        // get money the item]
        return itm_hf.getMoney(pmcData, money, body, output, sessionID);
    }

    // separate is that selling or buying
    confirmTrading(pmcData, body, sessionID)
    {
        // buying
        if (body.type === "buy_from_trader")
        {
            return this.buyItem(pmcData, body, sessionID);
        }

        // selling
        if (body.type === "sell_to_trader")
        {
            return this.sellItem(pmcData, body, sessionID);
        }

        return "";
    }

    // Ragfair trading
    confirmRagfairTrading(pmcData, body, sessionID)
    {
        let ragfair_offers_traders = database_f.database.tables.ragfair.offers;
        let offers = body.offers;
        let output = item_f.itemServer.getOutput();

        for (let offer of offers)
        {
            pmcData = profile_f.profileController.getPmcProfile(sessionID);
            body = {
                "Action": "TradingConfirm",
                "type": "buy_from_trader",
                "tid": "ragfair",
                "item_id": offer.id,
                "count": offer.count,
                "scheme_id": 0,
                "scheme_items": offer.items
            };

            for (let offerFromTrader of ragfair_offers_traders.offers)
            {
                if (offerFromTrader._id == offer.id)
                {
                    body.tid = offerFromTrader.user.id;
                    break;
                }
            }

            output = this.confirmTrading(pmcData, body, sessionID);
        }

        return output;
    }
}

class TradeCallbacks
{
    constructor()
    {
        item_f.itemServer.addRoute("TradingConfirm", this.processTrade.bind());
        item_f.itemServer.addRoute("RagFairBuyOffer", this.processRagfairTrade.bind());
    }

    processTrade(pmcData, body, sessionID)
    {
        return trade_f.tradeController.confirmTrading(pmcData, body, sessionID);
    }

    processRagfairTrade(pmcData, body, sessionID)
    {
        return trade_f.tradeController.confirmRagfairTrading(pmcData, body, sessionID);
    }
}

module.exports.tradeController = new TradeController();
module.exports.TradeCallbacks = new TradeCallbacks();
