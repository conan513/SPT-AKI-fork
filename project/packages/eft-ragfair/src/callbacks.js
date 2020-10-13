/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.server.onStart["loadRagfair"] = this.load.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/search"] = this.search.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/find"] = this.search.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/itemMarketPrice"] = this.itemMarketPrice.bind(this);
        https_f.router.onStaticRoute["/client/items/prices"] = this.getItemPrices.bind(this);
        item_f.eventHandler.onEvent["RagFairAddOffer"] = this.addOffer.bind(this);
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
        return https_f.response.nullResponse();
    }

    getItemPrices(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    addOffer()
    {
        return null;
    }
}

module.exports.Callbacks = Callbacks;
