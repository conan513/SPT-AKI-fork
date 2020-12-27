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
        https_f.router.onStaticRoute["/client/trading/api/getTradersList"] = this.getTraderList.bind(this);
        https_f.router.onDynamicRoute["/client/trading/api/getUserAssortPrice/trader/"] = this.getProfilePurchases.bind(this);
        https_f.router.onDynamicRoute["/client/trading/api/getTrader/"] = this.getTrader.bind(this);
        https_f.router.onDynamicRoute["/client/trading/api/getTraderAssort/"] = this.getAssort.bind(this);
        keepalive_f.controller.onExecute["traders"] = this.onUpdate.bind(this);
    }

    getTraderList(url, info, sessionID)
    {
        return https_f.response.getBody(trader_f.controller.getAllTraders(sessionID));
    }

    getProfilePurchases(url, info, sessionID)
    {
        const traderID = url.substr(url.lastIndexOf("/") + 1);
        return https_f.response.getBody(trader_f.controller.getPurchasesData(traderID, sessionID));
    }

    getTrader(url, info, sessionID)
    {
        const traderID = url.replace("/client/trading/api/getTrader/", "");
        trader_f.controller.updateTraders();
        return https_f.response.getBody(trader_f.controller.getTrader(traderID, sessionID));
    }

    getAssort(url, info, sessionID)
    {
        const traderID = url.replace("/client/trading/api/getTraderAssort/", "");
        trader_f.controller.updateTraders();
        return https_f.response.getBody(trader_f.controller.getAssort(sessionID, traderID));
    }

    onUpdate(sessionID)
    {
        trader_f.controller.updateTraders(sessionID);
    }
}

module.exports.Callbacks = Callbacks;