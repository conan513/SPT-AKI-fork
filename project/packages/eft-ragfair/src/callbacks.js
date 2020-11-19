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
        return https_f.response.getBody(ragfair_f.controller.getMarketPrice(info));
    }

    getItemPrices(url, info, sessionID)
    {
        return https_f.response.getBody(ragfair_f.controller.getItemPrices());
    }

    addOffer()
    {
        return ragfair_f.controller.addOffer(pmcData, info, sessionID);
    }

    removeOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.removeOffer(pmcData, info, sessionID);
    }

    extendOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.extendOffer(pmcData, info, sessionID);
    }
}

module.exports.Callbacks = Callbacks;
