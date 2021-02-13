/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");

class TraderCallbacks
{
    static load()
    {
        trader_f.controller.load();
    }

    static getTraderList(url, info, sessionID)
    {
        return HttpResponse.getBody(trader_f.controller.getAllTraders(sessionID));
    }

    static getProfilePurchases(url, info, sessionID)
    {
        const traderID = url.substr(url.lastIndexOf("/") + 1);
        return HttpResponse.getBody(trader_f.controller.getPurchasesData(traderID, sessionID));
    }

    static getTrader(url, info, sessionID)
    {
        const traderID = url.replace("/client/trading/api/getTrader/", "");
        trader_f.controller.updateTraders();
        return HttpResponse.getBody(trader_f.controller.getTrader(traderID, sessionID));
    }

    static getAssort(url, info, sessionID)
    {
        const traderID = url.replace("/client/trading/api/getTraderAssort/", "");
        trader_f.controller.updateTraders();
        return HttpResponse.getBody(trader_f.controller.getAssort(sessionID, traderID));
    }

    static update()
    {
        return trader_f.controller.updateTraders();
    }
}

module.exports = TraderCallbacks;
