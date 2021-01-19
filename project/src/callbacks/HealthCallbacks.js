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
    constructor()
    {
        save_f.server.onLoad["health"] = this.onLoad.bind(this);
        https_f.router.addStaticRoute("/player/health/sync", "Aki", this.syncHealth.bind(this));
        item_f.eventHandler.addEvent("Eat", "Aki", this.offraidEat.bind(this));
        item_f.eventHandler.addEvent("Heal", "Aki", this.offraidHeal.bind(this));
        item_f.eventHandler.addEvent("RestoreHealth", "Aki", this.healthTreatment.bind(this));
    }

    onLoad(sessionID)
    {
        return health_f.controller.resetVitality(sessionID);
    }

    syncHealth(url, info, sessionID)
    {
        health_f.controller.saveVitality(profile_f.controller.getPmcProfile(sessionID), info, sessionID);
        return https_f.response.emptyResponse();
    }

    offraidEat(pmcData, body, sessionID)
    {
        return health_f.controller.offraidEat(pmcData, body, sessionID);
    }

    offraidHeal(pmcData, body, sessionID)
    {
        return health_f.controller.offraidHeal(pmcData, body, sessionID);
    }

    healthTreatment(pmcData, info, sessionID)
    {
        return health_f.controller.healthTreatment(pmcData, info, sessionID);
    }
}

module.exports = new HealthCallbacks();
