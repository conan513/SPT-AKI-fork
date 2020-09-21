"use strict";

class CustomizationController
{
    wearClothing(pmcData, body, sessionID)
    {
        for (let i = 0; i < body.suites.length; i++)
        {
            let suite = database_f.database.tables.templates.suits[body.suites[i]];

            // this parent reffers to Lower Node
            if (suite._parent == "5cd944d01388ce000a659df9")
            {
                pmcData.Customization.Feet = suite._props.Feet;
            }

            // this parent reffers to Upper Node
            if (suite._parent == "5cd944ca1388ce03a44dc2a4")
            {
                pmcData.Customization.Body = suite._props.Body;
                pmcData.Customization.Hands = suite._props.Hands;
            }
        }

        return item_f.itemServer.getOutput();
    }

    getTraderSuits(traderID, sessionID)
    {
        let pmcData = profile_f.profileController.getPmcProfile(sessionID);
        let suitTemplates = database_f.database.tables.templates.suits;
        let suitArray = database_f.database.tables.traders[traderID].suits;
        let suitList = [];

        // get only suites from the player's side (e.g. USEC)
        for (let suit of suitArray)
        {
            if (suit.suiteId in suitTemplates)
            {
                for (let i = 0; i < suitTemplates[suit.suiteId]._props.Side.length; i++)
                {
                    let side = suitTemplates[suit.suiteId]._props.Side[i];

                    if (side === pmcData.Info.Side)
                    {
                        suitList.push(suit);
                    }
                }
            }
        }

        return suitList;
    }

    getAllTraderSuits(sessionID)
    {
        let output = [];

        for (let traderID in database_f.database.tables.traders)
        {
            output.push(this.getTraderSuits(traderID, sessionID));
        }

        return output;
    }

    buyClothing(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
        let storage = json.parse(json.read(save_f.saveServer.getSuitsPath(sessionID)));
        let offers = this.getAllTraderSuits(sessionID);

        // check if outfit already exists
        for (let suiteId of storage)
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

        // add outfit to storage
        for (let offer of offers)
        {
            if (body.offer === offer._id)
            {
                storage.push(offer.suiteId);
                break;
            }
        }

        json.write(save_f.saveServer.getSuitsPath(sessionID), storage);
        return output;
    }
}

class CustomizationCallbacks
{
    constructor()
    {
        router.addDynamicRoute("/client/trading/customization/", this.getTraderSuits.bind());
        router.addStaticRoute("/client/trading/customization/storage", this.getCustomizationStorage.bind());
        item_f.itemServer.addRoute("CustomizationWear", this.wearClothing.bind());
        item_f.itemServer.addRoute("CustomizationBuy", this.buyClothing.bind());
    }

    getCustomizationStorage(url, info, sessionID)
    {
        return response_f.responseController.getBody({
            "_id": `pmc${sessionID}`,
            "suites": json.parse(json.read(save_f.saveServer.getSuitsPath(sessionID)))
        });
    }

    getTraderSuits(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let traderID = splittedUrl[splittedUrl.length - 2];

        return response_f.responseController.getBody(customization_f.customizationController.getTraderSuits(traderID, sessionID));
    }

    wearClothing(pmcData, body, sessionID)
    {
        return customization_f.customizationController.wearClothing(pmcData, body, sessionID);
    }

    buyClothing(pmcData, body, sessionID)
    {
        return customization_f.CustomizationController.buyClothing(pmcData, body, sessionID);
    }
}

module.exports.customizationController = new CustomizationController();
module.exports.customizationCallbacks = new CustomizationCallbacks();
