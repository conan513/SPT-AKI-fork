"use strict";

require("../Lib.js");

class ItemEventRouter
{
    static output = null;
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
                Logger.write(body);
            }
        }

        ItemEventRouter.resetOutput(sessionID);
        return result;
    }

    static getOutput(sessionID)
    {
        if (!ItemEventRouter.output)
        {
            ItemEventRouter.resetOutput(sessionID);
        }

        return ItemEventRouter.output;
    }

    static setOutput(data)
    {
        ItemEventRouter.output = data;
    }

    static resetOutput(sessionID)
    {
        if (!sessionID)
        {
            throw "SessionID is required";
        }

        ItemEventRouter.output = {
            "profileChanges": {
                [sessionID]: {
                    "items": {
                        "new": [],
                        "change": [],
                        "del": []
                    },
                    "quests": [],
                    "ragFairOffers": [],
                    "builds": [],
                    "traderRelations": {},
                    "production": {},
                    "experience": 0
                }
            },
            "warnings": []
        };
    }
}

module.exports = ItemEventRouter;
