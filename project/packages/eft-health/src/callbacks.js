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
        save_f.server.onLoadCallback["health"] = this.onLoad.bind(this);
        router_f.router.staticRoutes["/player/health/sync"] = this.syncHealth.bind(this);
        router_f.router.staticRoutes["/player/health/events"] = this.updateHealth.bind(this);
        item_f.router.routes["Eat"] = this.offraidEat.bind(this);
        item_f.router.routes["Heal"] = this.offraidHeal.bind(this);
        item_f.router.routes["RestoreHealth"] = this.healthTreatment.bind(this);
    }

    onLoad(sessionID)
    {
        return health_f.controller.resetVitality(sessionID);
    }

    syncHealth(url, info, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        health_f.controller.saveVitality(pmcData, info, sessionID);
        return response_f.controller.nullResponse();
    }

    updateHealth(url, info, sessionID)
    {
        health_f.controller.updateHealth(info, sessionID);
        return response_f.controller.nullResponse();
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
