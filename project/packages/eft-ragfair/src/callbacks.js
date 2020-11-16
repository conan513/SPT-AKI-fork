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
        https_f.router.onStaticRoute["/client/ragfair/itemMarketPrice"] = this.itemMarketPrice.bind(this);
        https_f.router.onStaticRoute["/client/items/prices"] = this.getItemPrices.bind(this);
        item_f.eventHandler.onEvent["RagFairAddOffer"] = this.addOffer.bind(this);
        item_f.eventHandler.onEvent["RagFairRemoveOffer"] = this.removeOffer.bind(this);
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

    itemMarketPrice(url, info, sessionID)
    {
        return https_f.response.getBody(ragfair_f.controller.getItemPrice(info));
    }

    getItemPrices(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    addOffer(pmcData, request, sessionID)
    {
        common_f.logger.logInfo(common_f.json.serialize(request)); // TODO: Remove this once finished
        return ragfair_f.controller.addOffer(pmcData, request, sessionID);
    }

    removeOffer(pmcData, request, sessionID)
    {
        return ragfair_f.controller.removeOffer(request.offerId, sessionID);
    }

    extendOffer(pmcData, request, sessionID)
    {
        common_f.logger.logInfo(common_f.json.serialize(request)); // TODO: Remove this once finished
        return ragfair_f.controller.extendOffer(request.offerId, sessionID);
    }

    processOffers(sessionID)
    {
        ragfair_f.controller.processOffers(sessionID);
    }
}

module.exports.Callbacks = Callbacks;
