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

            if (body.Action in this.onEvent)
            {
                result = this.onEvent[body.Action](pmcData, body, sessionID);
            }
            else
            {
                common_f.logger.logError(`[UNHANDLED EVENT] ${body.Action}`);
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
     *
     *
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
