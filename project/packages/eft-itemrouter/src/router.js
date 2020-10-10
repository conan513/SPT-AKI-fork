/* router.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

class Router
{
    constructor()
    {
        this.output = "";
        this.routes = {};

        this.resetOutput();
    }

    handleRoutes(info, sessionID)
    {
        let result = "";

        for (let body of info.data)
        {
            const pmcData = profile_f.controller.getPmcProfile(sessionID);

            if (body.Action in this.routes)
            {
                result = this.routes[body.Action](pmcData, body, sessionID);
            }
            else
            {
                logger_f.instance.logError(`[UNHANDLED ACTION] ${body.Action}`);
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

    setOutput(data)
    {
        this.output = data;
    }

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

module.exports.Router = Router;
