/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class Controller
{
    buyItem(pmcData, body, sessionID)
    {
        if (body.tid === "579dc571d53a0658a154fbec")
        {
            body.tid = "ragfair";
        }

        let callback = () =>
        {
            if (!helpfunc_f.helpFunctions.payMoney(pmcData, body, sessionID))
            {
                common_f.logger.logError("no money found");
                throw "Transaction failed";
            }

            common_f.logger.logSuccess("Bought item: " + body.item_id);
        };

        const newReq = {
            "items": [{
                "item_id": body.item_id,
                "count": body.count,
            }],
            "tid": body.tid
        };

        return inventory_f.controller.addItem(pmcData, newReq, item_f.eventHandler.getOutput(), sessionID, callback);
    }

    // Selling item to trader
    sellItem(pmcData, body, sessionID)
    {
        let money = 0;
        let prices = trader_f.controller.getPurchasesData(body.tid, sessionID);
        let output = item_f.eventHandler.getOutput();

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
                    common_f.logger.logInfo("Selling: " + checkID);

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
        return helpfunc_f.helpFunctions.getMoney(pmcData, money, body, output, sessionID);
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
        let output = item_f.eventHandler.getOutput();

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

            output = this.confirmTrading(pmcData, body, sessionID);
        }

        return output;
    }
}

module.exports.Controller = Controller;
