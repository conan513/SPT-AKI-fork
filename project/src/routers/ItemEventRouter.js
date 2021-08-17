"use strict";

require("../Lib.js");

class ItemEventRouter
{
    static onEvent = require("../bindings/ItemEvents");
    static output = {
        "warnings": [],
        "profileChanges": {}
    };

    static handleEvents(info, sessionID)
    {
        let result = {};

        for (let body of info.data)
        {
            const pmcData = ProfileController.getPmcProfile(sessionID);

            if (ItemEventRouter.onEvent[body.Action])
            {
                for (const callback in ItemEventRouter.onEvent[body.Action])
                {
                    result = ItemEventRouter.onEvent[body.Action][callback](pmcData, body, sessionID);
                }
            }
            else
            {
                Logger.error(`[UNHANDLED EVENT] ${body.Action}`);
                console.log(body);
            }
        }

        ItemEventRouter.resetOutput(sessionID);
        return result;
    }

    static getOutput(sessionID)
    {
        if (!ItemEventRouter.output.profileChanges[sessionID])
        {
            ItemEventRouter.resetOutput(sessionID);
        }

        return ItemEventRouter.profileChanges;
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

        const pmcData = ProfileController.getPmcProfile(sessionID);
        let skills = JsonUtil.clone(pmcData.Skills.Common);

        for (let skill of skills)
        {
            skill.Progress = 0;
        }

        ItemEventRouter.output.profileChanges[sessionID] = {
            "_id": sessionID,
            "experience": 0,
            "quests": [],
            "ragFairOffers": [],
            "builds": [],
            "items": {
                "new": [],
                "change": [],
                "del": []
            },
            "production": {},
            "skills": {
                "Common": skills,
                "Mastering": [],
                "Points": 0
            },
            "traderRelations": {}
        };
    }
}

module.exports = ItemEventRouter;
