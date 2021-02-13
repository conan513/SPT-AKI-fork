/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 * - Terkoiz
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");
const JsonUtil = require("../utils/JsonUtil");
const Logger = require("../utils/Logger");

class RagfairCallbacks
{
    static load()
    {
        ragfair_f.server.load();
    }

    static search(url, info, sessionID)
    {
        return HttpResponse.getBody(ragfair_f.controller.getOffers(sessionID, info));
    }

    static getMarketPrice(url, info, sessionID)
    {
        return HttpResponse.getBody(ragfair_f.controller.getItemPrice(info));
    }

    static getItemPrices(url, info, sessionID)
    {
        return HttpResponse.getBody(ragfair_f.server.prices.dynamic);
    }

    static addOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.addPlayerOffer(pmcData, info, sessionID);
    }

    static removeOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.removeOffer(info.offerId, sessionID);
    }

    static extendOffer(pmcData, info, sessionID)
    {
        Logger.info(JsonUtil.serialize(info)); // TODO: Remove this once finished
        return ragfair_f.controller.extendOffer(info, sessionID);
    }

    static update(timeSinceLastRun)
    {
        ragfair_f.server.update();
        return true;
    }

    /* todo: merge remains with main update function above */
    static updatePlayer(timeSinceLastRun)
    {
        /* should be a config var, but might not be around for long */
        const runInterval = 1 * 60;

        if (timeSinceLastRun > runInterval)
        {
            ragfair_f.controller.update();
            return true;
        }
    }
}

module.exports = RagfairCallbacks;
