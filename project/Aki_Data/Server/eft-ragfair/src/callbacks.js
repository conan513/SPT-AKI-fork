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
        core_f.packager.onUpdate["ragfair-process-offers"] = this.update.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/search"] = this.search.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/find"] = this.search.bind(this);
        https_f.router.onStaticRoute["/client/ragfair/itemMarketPrice"] = this.getMarketPrice.bind(this);
        https_f.router.onStaticRoute["/client/items/prices"] = this.getItemPrices.bind(this);
        item_f.eventHandler.onEvent["RagFairAddOffer"] = this.addOffer.bind(this);
        item_f.eventHandler.onEvent["RagFairRemoveOffer"] = this.removeOffer.bind(this);
        item_f.eventHandler.onEvent["RagFairRenewOffer"] = this.extendOffer.bind(this);
    }

    load()
    {
        ragfair_f.server.load();
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
        return https_f.response.getBody(ragfair_f.server.prices.dynamic);
    }

    addOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.addPlayerOffer(pmcData, info, sessionID);
    }

    removeOffer(pmcData, info, sessionID)
    {
        return ragfair_f.controller.removeOffer(info.offerId, sessionID);
    }

    extendOffer(pmcData, info, sessionID)
    {
        common_f.logger.logInfo(common_f.json.serialize(info)); // TODO: Remove this once finished
        return ragfair_f.controller.extendOffer(info, sessionID);
    }

    update(sessionID)
    {
        ragfair_f.server.update();
        ragfair_f.controller.update();
    }
}

module.exports.Callbacks = Callbacks;
