/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HealthCallbacks
{
    static onLoad(sessionID)
    {
        return health_f.controller.resetVitality(sessionID);
    }

    static syncHealth(url, info, sessionID)
    {
        health_f.controller.saveVitality(profile_f.controller.getPmcProfile(sessionID), info, sessionID);
        return https_f.response.emptyResponse();
    }

    static offraidEat(pmcData, body, sessionID)
    {
        return health_f.controller.offraidEat(pmcData, body, sessionID);
    }

    static offraidHeal(pmcData, body, sessionID)
    {
        return health_f.controller.offraidHeal(pmcData, body, sessionID);
    }

    static healthTreatment(pmcData, info, sessionID)
    {
        return health_f.controller.healthTreatment(pmcData, info, sessionID);
    }
}

module.exports = HealthCallbacks;
