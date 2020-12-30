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

class Callbacks
{
    constructor()
    {
        core_f.packager.onLoad["loadRagfair"] = this.load.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/search"] = this.search.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/find"] = this.search.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/itemMarketPrice"] = this.getMarketPrice.bind(this);
        https_f.router.onStaticRoute["/client/items/prices"] = this.getItemPrices.bind(this);
        item_f.eventHandler.onEvent["RagFairAddOffer"] = this.addOffer.bind(this);
        item_f.eventHandler.onEvent["RagFairRemoveOffer"] = this.removeOffer.bind(this);
        item_f.eventHandler.onEvent["RagFairExtendOffer"] = this.extendOffer.bind(this);
        keepalive_f.controller.onExecute["ragfair-process-offers"] = this.processOffers.bind(this);
    }

    load()
    {
        ragfair_f.controller.initialize();
    }

    search(url, info, sessionID)
    {
        return https_f.response.getBody(ragfair_f.controller.getOffers(sessionID, info));
    }

    getMarketPrice(url, info, sessionID)
    {
        return https_f.response.getBody(ragfair_f.controller.getItemPrice(info));
    }

    getItemPrices(url, info, sessionID)
    {
        return https_f.response.getBody(ragfair_f.controller.getItemPrices());
    }

    addOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.addPlayerOffer(pmcData, info, sessionID);
    }

    removeOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.removeOffer(info, sessionID);
    }

    extendOffer(pmcData, info, sessionID)
    {
        common_f.logger.logInfo(common_f.json.serialize(info)); // TODO: Remove this once finished
        return ragfair_f.controller.extendOffer(info, sessionID);
    }

    processOffers(sessionID)
    {
        ragfair_f.controller.processOffers(sessionID);
    }
}

module.exports.Callbacks = Callbacks;
