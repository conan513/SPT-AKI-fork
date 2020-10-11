/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class Callbacks
{
    constructor()
    {
        item_f.router.routes["TradingConfirm"] = this.processTrade.bind(this);
        item_f.router.routes["RagFairBuyOffer"] = this.processRagfairTrade.bind(this);
    }

    processTrade(pmcData, body, sessionID)
    {
        return trade_f.controller.confirmTrading(pmcData, body, sessionID);
    }

    processRagfairTrade(pmcData, body, sessionID)
    {
        return trade_f.controller.confirmRagfairTrading(pmcData, body, sessionID);
    }
}

module.exports.Callbacks = Callbacks;
