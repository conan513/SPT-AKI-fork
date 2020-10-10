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
        save_f.server.onLoadCallback["eft-insurance"] = this.onLoad.bind(this);
        save_f.server.onSaveCallbacks["eft-insurance"] = this.onSave.bind(this);
        server_f.server.receiveCallback["eft-insurance"] = this.checkInsurance.bind(this);
        router_f.router.staticRoutes["/client/insurance/items/list/cost"] = this.getInsuranceCost.bind(this);
        item_f.router.routes["Insure"] = this.insure.bind(this);
    }

    onLoad(sessionID)
    {
        return insurance_f.controller.resetInsurance(sessionID);
    }

    onSave(sessionID)
    {
        return insurance_f.controller.onSave(sessionID);
    }

    checkInsurance(sessionID, req, resp, body, output)
    {
        if (req.url === "/client/notifier/channel/create")
        {
            insurance_f.controller.checkExpiredInsurance(sessionID);
        }
    }

    getInsuranceCost(url, info, sessionID)
    {
        return response_f.controller.getBody(insurance_f.controller.cost(info, sessionID));
    }

    insure(pmcData, body, sessionID)
    {
        return insurance_f.controller.insure(pmcData, body, sessionID);
    }
}

module.exports.Callbacks = Callbacks;
