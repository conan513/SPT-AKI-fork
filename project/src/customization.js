/* customization.js
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
    onLoad(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        if (!("suits" in profile))
        {
            profile.suits = [];
        }

        return profile;
    }

    wearClothing(pmcData, body, sessionID)
    {
        for (let i = 0; i < body.suites.length; i++)
        {
            let suite = database_f.database.tables.templates.suits[body.suites[i]];

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

        return item_f.router.getOutput();
    }

    getTraderSuits(traderID, sessionID)
    {
        console.log(database_f.database.tables.traders[traderID].suits);
        console.log(traderID);

        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let templates = database_f.database.tables.templates.suits;
        let suits = database_f.database.tables.traders[traderID].suits;
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
        const traders = database_f.database.tables.traders;
        let result = [];

        for (let traderID in traders)
        {
            if (traders[traderID].base.customization_seller === true)
            {
                result.push(this.getTraderSuits(traderID, sessionID));
            }
        }

        return result;
    }

    buyClothing(pmcData, body, sessionID)
    {
        let output = item_f.router.getOutput();
        let suits = save_f.server.profiles[sessionID].suits;
        let offers = this.getAllTraderSuits(sessionID);

        // check if outfit already exists
        for (let suiteId of suits)
        {
            if (suiteId === body.offer)
            {
                return output;
            }
        }

        // pay items
        for (let sellItem in body.items)
        {
            for (let item in pmcData.Inventory.items)
            {
                if (pmcData.Inventory.items[item]._id !== sellItem.id)
                {
                    continue;
                }

                if (pmcData.Inventory.items[item].upd.StackObjectsCount === sellItem.count && sellItem.del === true)
                {
                    output.items.del.push({"_id": sellItem.id});
                    pmcData.Inventory.items.splice(item, 1);
                }
                else if (pmcData.Inventory.items[item].upd.StackObjectsCount > sellItem.count)
                {
                    pmcData.Inventory.items[item].upd.StackObjectsCount -= sellItem.count;

                    output.items.change.push({
                        "_id": pmcData.Inventory.items[item]._id,
                        "_tpl": pmcData.Inventory.items[item]._tpl,
                        "parentId": pmcData.Inventory.items[item].parentId,
                        "slotId": pmcData.Inventory.items[item].slotId,
                        "location": pmcData.Inventory.items[item].location,
                        "upd": {"StackObjectsCount": pmcData.Inventory.items[item].upd.StackObjectsCount}
                    });

                    break;
                }
            }
        }

        // add outfit to suits
        for (let offer of offers)
        {
            if (body.offer === offer._id)
            {
                suits.push(offer.suiteId);
                break;
            }
        }

        save_f.server.profiles[sessionID].suits = suits;
        return output;
    }
}

class Callbacks
{
    constructor()
    {
        save_f.server.onLoadCallback["customization"] = this.onLoad.bind();

        router.addDynamicRoute("/client/trading/customization/", this.getTraderSuits.bind());
        router.addStaticRoute("/client/trading/customization/storage", this.getSuits.bind());
        item_f.router.addRoute("CustomizationWear", this.wearClothing.bind());
        item_f.router.addRoute("CustomizationBuy", this.buyClothing.bind());
    }

    onLoad(sessionID)
    {
        return customization_f.controller.onLoad(sessionID);
    }

    getSuits(url, info, sessionID)
    {
        return response_f.controller.getBody({
            "_id": `pmc${sessionID}`,
            "suites": save_f.server.profiles[sessionID].suits
        });
    }

    getTraderSuits(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let traderID = splittedUrl[splittedUrl.length - 2];

        return response_f.controller.getBody(customization_f.controller.getTraderSuits(traderID, sessionID));
    }

    wearClothing(pmcData, body, sessionID)
    {
        return customization_f.controller.wearClothing(pmcData, body, sessionID);
    }

    buyClothing(pmcData, body, sessionID)
    {
        return customization_f.controller.buyClothing(pmcData, body, sessionID);
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
