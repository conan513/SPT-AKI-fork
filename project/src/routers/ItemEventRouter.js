/* events.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

class ItemEventRouter
{
    /** @type {apiEventResponse} */
    static output = ItemEventRouter.getOutput();
    static onEvent = require("../bindings/ItemEvents");

    /**
     * @param {{ data: any; }} info
     * @param {string} sessionID
     */
    static handleEvents(info, sessionID)
    {
        let result = "";

        for (let body of info.data)
        {
            const pmcData = profile_f.controller.getPmcProfile(sessionID);

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

    /**
     * @param {apiEventResponse} data
     */
    static setOutput(data)
    {
        ItemEventRouter.output = data;
    }

    /**
     * @memberof EventHandler
     */
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
