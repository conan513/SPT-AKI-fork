/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

const Logger = require("../utils/Logger");

class TradeController
{
    /**
     * @param {UserPMCProfile} pmcData
     * @param {{ item_id?: any; count?: any; tid: any; Action?: any; scheme_items?: any; }} body
     * @param {string} sessionID
     * @param {boolean} foundInRaid
     * @param {any} upd
     */
    buyItem(pmcData, body, sessionID, foundInRaid, upd)
    {
        const output = ItemEventRouter.getOutput();
        const newReq = {
            "items": [
                {
                    "item_id": body.item_id,
                    "count": body.count,
                }
            ],
            "tid": body.tid
        };
        const callback = () =>
        {
            if (!Helpers.payMoney(pmcData, body, sessionID))
            {
                Logger.error("no money found");
                throw "Transaction failed";
            }

            Logger.success("Bought item: " + body.item_id);
        };

        return inventory_f.controller.addItem(pmcData, newReq, output, sessionID, callback, foundInRaid, upd);
    }

    /**
     * Selling item to trader
     * @param {UserPMCProfile} pmcData
     * @param {{ tid: any; items?: any; }} body
     * @param {any} sessionID
     */
    sellItem(pmcData, body, sessionID)
    {
        let money = 0;
        let prices = trader_f.controller.getPurchasesData(body.tid, sessionID);
        let output = ItemEventRouter.getOutput();

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
                    Logger.info("Selling: " + checkID);

                    // remove item
                    insurance_f.controller.remove(pmcData, checkID, sessionID);
                    output = inventory_f.controller.removeItem(pmcData, checkID, output, sessionID);

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
        return Helpers.getMoney(pmcData, money, body, output, sessionID);
    }

    // separate is that selling or buying
    confirmTrading(pmcData, body, sessionID, foundInRaid = false, upd = null)
    {
        // buying
        if (body.type === "buy_from_trader")
        {
            return this.buyItem(pmcData, body, sessionID, foundInRaid, upd);
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
        let output = ItemEventRouter.getOutput();

        for (let offer of body.offers)
        {
            let data = ragfair_f.server.getOffer(offer.id);
            console.log(offer);

            pmcData = profile_f.controller.getPmcProfile(sessionID);
            body = {
                "Action": "TradingConfirm",
                "type": "buy_from_trader",
                "tid": (data.user.memberType !== 4) ? "ragfair" : data.user.id,
                "item_id": data.root,
                "count": offer.count,
                "scheme_id": 0,
                "scheme_items": offer.items
            };

            if (data.user.memberType !== 4)
            {
                // remove player item offer stack
                ragfair_f.server.removeOfferStack(data._id, offer.count);
            }

            output = this.confirmTrading(pmcData, body, sessionID, false, data.items[0].upd);
        }

        return output;
    }
}

module.exports = new TradeController();
