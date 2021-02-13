/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HealthController = require("../controllers/HealthController.js");
const HttpResponse = require("../utils/HttpResponse.js");

class HealthCallbacks
{
    static onLoad(sessionID)
    {
        return HealthController.resetVitality(sessionID);
    }

    static syncHealth(url, info, sessionID)
    {
        HealthController.saveVitality(profile_f.controller.getPmcProfile(sessionID), info, sessionID);
        return HttpResponse.emptyResponse();
    }

    static offraidEat(pmcData, body, sessionID)
    {
        return HealthController.offraidEat(pmcData, body, sessionID);
    }

    static offraidHeal(pmcData, body, sessionID)
    {
        return HealthController.offraidHeal(pmcData, body, sessionID);
    }

    static healthTreatment(pmcData, info, sessionID)
    {
        return HealthController.healthTreatment(pmcData, info, sessionID);
    }
}

module.exports = HealthCallbacks;
