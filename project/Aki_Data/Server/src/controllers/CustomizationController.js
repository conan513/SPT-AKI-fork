/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class CustomizationController
{
    wearClothing(pmcData, body, sessionID)
    {
        for (let i = 0; i < body.suites.length; i++)
        {
            let suite = database_f.server.tables.templates.suits[body.suites[i]];

            // this parent reffers to Lower Node
            if (suite._parent === "5cd944d01388ce000a659df9")
            {
                pmcData.Customization.Feet = suite._props.Feet;
            }

            // this parent reffers to Upper Node
            if (suite._parent === "5cd944ca1388ce03a44dc2a4")
            {
                pmcData.Customization.Body = suite._props.Body;
                pmcData.Customization.Hands = suite._props.Hands;
            }
        }

        return item_f.eventHandler.getOutput();
    }

    getTraderSuits(traderID, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let templates = database_f.server.tables.templates.suits;
        let suits = database_f.server.tables.traders[traderID].suits;
        let result = [];

        // get only suites from the player's side (e.g. USEC)
        for (const suit of suits)
        {
            if (suit.suiteId in templates)
            {
                for (let i = 0; i < templates[suit.suiteId]._props.Side.length; i++)
                {
                    if (templates[suit.suiteId]._props.Side[i] === pmcData.Info.Side)
                    {
                        result.push(suit);
                    }
                }
            }
        }

        return result;
    }

    getAllTraderSuits(sessionID)
    {
        const traders = database_f.server.tables.traders;
        let result = [];

        for (let traderID in traders)
        {
            if (traders[traderID].base.customization_seller === true)
            {
                result = [...result, ...this.getTraderSuits(traderID, sessionID)];
            }
        }

        return result;
    }

    buyClothing(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

        // find suit offer
        const offers = this.getAllTraderSuits(sessionID);
        let offer = offers.find((suit) =>
        {
            return body.offer === suit._id;
        });

        if (!offer)
        {
            common_f.logger.logError("OOPS");
            return output;
        }

        // check if outfit already exists
        if (save_f.server.profiles[sessionID].suits.find((suit) =>
        {
            return suit === body.offer;
        }))
        {
            return output;
        }

        // pay items
        for (let sellItem of body.items)
        {
            for (let itemID in pmcData.Inventory.items)
            {
                let item = pmcData.Inventory.items[itemID];

                if (item._id !== sellItem.id)
                {
                    continue;
                }

                if (sellItem.del === true)
                {
                    output.items.del.push({"_id": sellItem.id});
                    pmcData.Inventory.items.splice(itemID, 1);
                }

                if (item.upd.StackObjectsCount > sellItem.count)
                {
                    pmcData.Inventory.items[itemID].upd.StackObjectsCount -= sellItem.count;
                    output.items.change.push({
                        "_id": item._id,
                        "_tpl": item._tpl,
                        "parentId": item.parentId,
                        "slotId": item.slotId,
                        "location": item.location,
                        "upd": {"StackObjectsCount": item.upd.StackObjectsCount}
                    });
                }
            }
        }

        // add suit
        save_f.server.profiles[sessionID].suits.push(offer.suiteId);
        return output;
    }
}

module.exports = new CustomizationController();
