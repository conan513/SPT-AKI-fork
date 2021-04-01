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
const RagfairServer = require("../servers/RagfairServer.js");
const RagfairController = require("../controllers/RagfairController.js");

class RagfairCallbacks
{
    static load()
    {
        RagfairServer.load();
    }

    static search(url, info, sessionID)
    {
        return HttpResponse.getBody(RagfairController.getOffers(sessionID, info));
    }

    static getMarketPrice(url, info, sessionID)
    {
        return HttpResponse.getBody(RagfairController.getItemPrice(info));
    }

    static getItemPrices(url, info, sessionID)
    {
        return HttpResponse.getBody(RagfairServer.prices.dynamic);
    }

    static addOffer(pmcData, info, sessionID)
    {
        return RagfairController.addPlayerOffer(pmcData, info, sessionID);
    }

    static removeOffer(pmcData, info, sessionID)
    {
        return RagfairController.removeOffer(info.offerId, sessionID);
    }

    static extendOffer(pmcData, info, sessionID)
    {
        Logger.info(JsonUtil.serialize(info)); // TODO: Remove this once finished
        return RagfairController.extendOffer(info, sessionID);
    }

    static update(timeSinceLastRun)
    {
        RagfairServer.update();
        return true;
    }

    /* todo: merge remains with main update function above */
    static updatePlayer(timeSinceLastRun)
    {
        /* should be a config var, but might not be around for long */
        const runInterval = 1 * 60;

        if (timeSinceLastRun > runInterval)
        {
            RagfairController.update();
            return true;
        }
    }
}

module.exports = RagfairCallbacks;
