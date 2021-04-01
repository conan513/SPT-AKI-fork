/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const InsuranceConfig = require("../configs/Insuranceconfig.js");
const HttpResponse = require("../utils/HttpResponse");
const InsuranceController = require("../controllers/InsuranceController.js");

class InsuranceCallbacks
{
    static onLoad(sessionID)
    {
        return InsuranceController.onLoad(sessionID);
    }

    static getInsuranceCost(url, info, sessionID)
    {
        return HttpResponse.getBody(InsuranceController.cost(info, sessionID));
    }

    static insure(pmcData, body, sessionID)
    {
        return InsuranceController.insure(pmcData, body, sessionID);
    }

    static update(timeSinceLastRun)
    {
        if (timeSinceLastRun > InsuranceConfig.runInterval)
        {
            InsuranceController.processReturn();
            return true;
        }
        return false;
    }
}

module.exports = InsuranceCallbacks;
