/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class InsuranceCallbacks
{
    onLoad(sessionID)
    {
        return insurance_f.controller.onLoad(sessionID);
    }

    getInsuranceCost(url, info, sessionID)
    {
        return https_f.response.getBody(insurance_f.controller.cost(info, sessionID));
    }

    insure(pmcData, body, sessionID)
    {
        return insurance_f.controller.insure(pmcData, body, sessionID);
    }

    update(timeSinceLastRun)
    {
        if (timeSinceLastRun > insurance_f.config.runInterval)
        {
            insurance_f.controller.processReturn();
            return true;
        }
        return false;
    }
}

module.exports = new InsuranceCallbacks();
