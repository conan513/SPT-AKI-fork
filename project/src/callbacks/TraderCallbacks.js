/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class TraderCallbacks
{
    load()
    {
        trader_f.controller.load();
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

    update()
    {
        return trader_f.controller.updateTraders();
    }
}

module.exports = new TraderCallbacks();
