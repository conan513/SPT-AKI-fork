/* item.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

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
            let pmcData = profile_f.controller.getPmcProfile(sessionID);

            if (body.Action in this.routes)
            {
                result = this.routes[body.Action](pmcData, body, sessionID);
            }
            else
            {
                logger_f.instance.logError("[UNHANDLED ACTION] " + body.Action);
            }
        }

        this.resetOutput();
        return result;
    }

    getOutput()
    {
        if (this.output === "")
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
        this.output = {"items": {"new": [], "change": [], "del": []}, "badRequest": [], "quests": [], "ragFairOffers": [], "builds": [], "currentSalesSums": {}};
    }
}

class Callbacks
{
    constructor()
    {
        router_f.router.staticRoutes["/client/game/profile/items/moving"] = this.handleRoutes.bind(this);
    }

    handleRoutes(url, info, sessionID)
    {
        return response_f.controller.getBody(item_f.router.handleRoutes(info, sessionID));
    }
}

module.exports.router = new Router();
module.exports.callbacks = new Callbacks();
