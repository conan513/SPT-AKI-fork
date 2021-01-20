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

class RagfairCallbacks
{
    constructor()
    {
        /* should be a config var, but might not be around for long */
        this.runInterval = 1 * 60;
        core_f.packager.onLoad["loadRagfair"] = this.load.bind(this);
        core_f.packager.onUpdate["ragfair-update-offers"] = this.update.bind(this);
        core_f.packager.onUpdate["ragfair-process-playeroffers"] = this.updatePlayer.bind(this);
        https_f.router.addStaticRoute("/client/ragfair/search", "Aki", this.search.bind(this));
        https_f.router.addStaticRoute("/client/ragfair/find", "Aki", this.search.bind(this));
        https_f.router.addStaticRoute("/client/ragfair/itemMarketPrice", "Aki", this.getMarketPrice.bind(this));
        https_f.router.addStaticRoute("/client/items/prices", "Aki", this.getItemPrices.bind(this));
        item_f.eventHandler.addEvent("RagFairAddOffer", "Aki", this.addOffer.bind(this));
        item_f.eventHandler.addEvent("RagFairRemoveOffer", "Aki", this.removeOffer.bind(this));
        item_f.eventHandler.addEvent("RagFairRenewOffer", "Aki", this.extendOffer.bind(this));
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

    update(timeSinceLastRun)
    {
        ragfair_f.server.update();
        return true;
    }

    /* todo: merge remains with main update function above */
    updatePlayer(timeSinceLastRun)
    {
        if (timeSinceLastRun > this.runInterval)
        {
            ragfair_f.controller.update();
            return true;
        }
    }
}

module.exports = new RagfairCallbacks();
