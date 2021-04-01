"use strict";

require("../Lib.js");

class ItemEventRouter
{
    static output = ItemEventRouter.getOutput();
    static onEvent = require("../bindings/ItemEvents");

    static handleEvents(info, sessionID)
    {
        let result = "";

        for (let body of info.data)
        {
            const pmcData = ProfileController.getPmcProfile(sessionID);

            if (ItemEventRouter.onEvent[body.Action])
            {
                for (const callback in ItemEventRouter.onEvent[body.Action])
                {
                    result = ItemEventRouter.onEvent[body.Action][callback](pmcData, body, sessionID, result);
                }
            }
            else
            {
                Logger.error(`[UNHANDLED EVENT] ${body.Action}`);
            }
        }

        ItemEventRouter.resetOutput();
        return result;
    }

    static getOutput()
    {
        if (!ItemEventRouter.output)
        {
            ItemEventRouter.resetOutput();
        }

        return ItemEventRouter.output;
    }

    static setOutput(data)
    {
        ItemEventRouter.output = data;
    }

    static resetOutput()
    {
        ItemEventRouter.output = {
            "items": {
                "new": [],
                "change": [],
                "del": []
            },
            "badRequest": [],
            "quests": [],
            "ragFairOffers": [],
            "builds": [],
            "currentSalesSums": {}
        };
    }
}

module.exports = ItemEventRouter;
