/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const InsuranceConfig = require("../configs/InsuranceConfig.json");

class InsuranceCallbacks
{
    static onLoad(sessionID)
    {
        return insurance_f.controller.onLoad(sessionID);
    }

    static getInsuranceCost(url, info, sessionID)
    {
        return https_f.response.getBody(insurance_f.controller.cost(info, sessionID));
    }

    static insure(pmcData, body, sessionID)
    {
        return insurance_f.controller.insure(pmcData, body, sessionID);
    }

    static update(timeSinceLastRun)
    {
        if (timeSinceLastRun > InsuranceConfig.runInterval)
        {
            insurance_f.controller.processReturn();
            return true;
        }
        return false;
    }
}

module.exports = InsuranceCallbacks;
