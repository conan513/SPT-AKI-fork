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
        save_f.server.onLoad["health"] = this.onLoad.bind(this);
        https_f.router.onStaticRoute["/player/health/sync"] = this.syncHealth.bind(this);
        item_f.eventHandler.onEvent["Eat"] = this.offraidEat.bind(this);
        item_f.eventHandler.onEvent["Heal"] = this.offraidHeal.bind(this);
        item_f.eventHandler.onEvent["RestoreHealth"] = this.healthTreatment.bind(this);
    }

    onLoad(sessionID)
    {
        return health_f.controller.resetVitality(sessionID);
    }

    syncHealth(url, info, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        health_f.controller.saveVitality(pmcData, info, sessionID);
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

module.exports.Callbacks = Callbacks;
