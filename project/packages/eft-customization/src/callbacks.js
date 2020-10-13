/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.router.onStaticRoute["/client/trading/customization/storage"] = this.getSuits.bind(this);
        https_f.router.dynamicRoutes["/client/trading/customization/"] = this.getTraderSuits.bind(this);
        item_f.router.routes["CustomizationWear"] = this.wearClothing.bind(this);
        item_f.router.routes["CustomizationBuy"] = this.buyClothing.bind(this);
    }

    getSuits(url, info, sessionID)
    {
        return https_f.response.getBody({
            "_id": `pmc${sessionID}`,
            "suites": save_f.server.profiles[sessionID].suits
        });
    }

    getTraderSuits(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let traderID = splittedUrl[splittedUrl.length - 2];

        return https_f.response.getBody(customization_f.controller.getTraderSuits(traderID, sessionID));
    }

    wearClothing(pmcData, body, sessionID)
    {
        return customization_f.controller.wearClothing(pmcData, body, sessionID);
    }

    buyClothing(pmcData, body, sessionID)
    {
        return customization_f.controller.buyClothing(pmcData, body, sessionID);
    }
}


module.exports.Callbacks = Callbacks;
