/* events.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

class ItemEventRouter
{
    constructor()
    {
        /** @type {apiEventResponse} */
        this.output;
        this.onEvent = {};

        this.resetOutput();
    }

    /**
     * @param {{ data: any; }} info
     * @param {string} sessionID
     */
    handleEvents(info, sessionID)
    {
        let result = "";

        for (let body of info.data)
        {
            const pmcData = profile_f.controller.getPmcProfile(sessionID);

            if (this.onEvent[body.Action])
            {
                for (const callback in this.onEvent[body.Action])
                {
                    result = this.onEvent[body.Action][callback](pmcData, body, sessionID, result);
                }
            }
            else
            {
                Logger.error(`[UNHANDLED EVENT] ${body.Action}`);
            }
        }

        this.resetOutput();
        return result;
    }

    getOutput()
    {
        if (!this.output)
        {
            this.resetOutput();
        }

        return this.output;
    }

    /**
     * @param {apiEventResponse} data
     */
    setOutput(data)
    {
        this.output = data;
    }

    /**
     * @memberof EventHandler
     */
    resetOutput()
    {
        this.output = {
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

module.exports = new ItemEventRouter();
