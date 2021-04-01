/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");
const PresetBuildController = require("../controllers/PresetBuildController.js");

class PresetBuildCallbacks
{
    static getHandbookUserlist(url, info, sessionID)
    {
        return HttpResponse.getBody(PresetBuildController.getUserBuilds(sessionID));
    }

    static saveBuild(pmcData, body, sessionID)
    {
        return PresetBuildController.saveBuild(pmcData, body, sessionID);
    }

    static removeBuild(pmcData, body, sessionID)
    {
        return PresetBuildController.removeBuild(pmcData, body, sessionID);
    }
}

module.exports = PresetBuildCallbacks;
