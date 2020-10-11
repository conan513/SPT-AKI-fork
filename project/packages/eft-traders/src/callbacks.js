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
        router_f.router.staticRoutes["/client/trading/api/getTradersList"] = this.getTraderList.bind(this);
        router_f.router.dynamicRoutes["/client/trading/api/getUserAssortPrice/trader/"] = this.getProfilePurchases.bind(this);
        router_f.router.dynamicRoutes["/client/trading/api/getTrader/"] = this.getTrader.bind(this);
        router_f.router.dynamicRoutes["/client/trading/api/getTraderAssort/"] = this.getAssort.bind(this);
    }

    getTraderList(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getAllTraders(sessionID));
    }

    getProfilePurchases(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getPurchasesData(url.substr(url.lastIndexOf("/") + 1), sessionID));
    }

    getTrader(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getTrader(url.replace("/client/trading/api/getTrader/", ""), sessionID));
    }

    getAssort(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getAssort(sessionID, url.replace("/client/trading/api/getTraderAssort/", "")));
    }
}

module.exports.Callbacks = Callbacks;
