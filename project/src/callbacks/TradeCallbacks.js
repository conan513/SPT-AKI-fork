/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class TradeCallbacks
{
    static processTrade(pmcData, body, sessionID)
    {
        return trade_f.controller.confirmTrading(pmcData, body, sessionID);
    }

    static processRagfairTrade(pmcData, body, sessionID)
    {
        return trade_f.controller.confirmRagfairTrading(pmcData, body, sessionID);
    }
}

module.exports = TradeCallbacks;
