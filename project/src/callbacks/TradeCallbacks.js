/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

const TradeController = require("../controllers/TradeController.js");

class TradeCallbacks
{
    static processTrade(pmcData, body, sessionID)
    {
        return TradeController.confirmTrading(pmcData, body, sessionID);
    }

    static processRagfairTrade(pmcData, body, sessionID)
    {
        return TradeController.confirmRagfairTrading(pmcData, body, sessionID);
    }
}

module.exports = TradeCallbacks;
