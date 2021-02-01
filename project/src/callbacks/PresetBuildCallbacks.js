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
    static getHandbookUserlist(url, info, sessionID)
    {
        return https_f.response.getBody(weaponbuilds_f.controller.getUserBuilds(sessionID));
    }

    static saveBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.controller.saveBuild(pmcData, body, sessionID);
    }

    static removeBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.controller.removeBuild(pmcData, body, sessionID);
    }
}

module.exports = PresetBuildCallbacks;
