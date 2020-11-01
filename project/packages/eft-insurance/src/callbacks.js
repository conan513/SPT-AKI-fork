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
        save_f.server.onLoad["eft-insurance"] = this.onLoad.bind(this);
        https_f.server.onReceive["eft-insurance"] = this.checkInsurance.bind(this);
        https_f.router.onStaticRoute["/client/insurance/items/list/cost"] = this.getInsuranceCost.bind(this);
        item_f.eventHandler.onEvent["Insure"] = this.insure.bind(this);
        keepalive_f.controller.onExecute["eft-insurance"] = this.onUpdate.bind(this);
    }

    onLoad(sessionID)
    {
        return insurance_f.controller.onLoad(sessionID);
    }

    checkInsurance(sessionID, req, resp, body, output) { }

    getInsuranceCost(url, info, sessionID)
    {
        return https_f.response.getBody(insurance_f.controller.cost(info, sessionID));
    }

    insure(pmcData, body, sessionID)
    {
        return insurance_f.controller.insure(pmcData, body, sessionID);
    }

    onUpdate(sessionID)
    {
        insurance_f.controller.processReturn(sessionID);
    }
}

module.exports.Callbacks = Callbacks;
