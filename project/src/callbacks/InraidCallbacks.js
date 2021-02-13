/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const InraidConfig = require("../configs/InraidConfig.json");
const HttpResponse = require("../utils/HttpResponse");

class InraidCallbacks
{
    static onLoad(sessionID)
    {
        return inraid_f.controller.onLoad(sessionID);
    }

    static registerPlayer(url, info, sessionID)
    {
        inraid_f.controller.addPlayer(sessionID, info);
        return HttpResponse.nullResponse();
    }

    static saveProgress(url, info, sessionID)
    {
        inraid_f.controller.saveProgress(info, sessionID);
        return HttpResponse.nullResponse();
    }

    static getRaidEndState()
    {
        return HttpResponse.noBody(InraidConfig.MIAOnRaidEnd);
    }

    static getRaidMenuSettings(url, info, sessionID)
    {
        return HttpResponse.noBody(InraidConfig.raidMenuSettings);
    }

    static getWeaponDurability(url, info, sessionID)
    {
        return HttpResponse.noBody(InraidConfig.save.durability);
    }
}

module.exports = InraidCallbacks;
