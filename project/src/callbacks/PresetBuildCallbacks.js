/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class PresetBuildCallbacks
{
    constructor()
    {
        https_f.router.addStaticRoute("/client/handbook/builds/my/list", "Aki", this.getHandbookUserlist.bind(this));
        item_f.eventHandler.addEvent("SaveBuild", "Aki", this.saveBuild.bind(this));
        item_f.eventHandler.addEvent("RemoveBuild", "Aki",this.removeBuild.bind(this));
    }

    getHandbookUserlist(url, info, sessionID)
    {
        return https_f.response.getBody(weaponbuilds_f.controller.getUserBuilds(sessionID));
    }

    saveBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.controller.saveBuild(pmcData, body, sessionID);
    }

    removeBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.controller.removeBuild(pmcData, body, sessionID);
    }
}

module.exports = new PresetBuildCallbacks();
