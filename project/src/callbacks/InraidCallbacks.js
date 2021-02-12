/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const InraidConfig = require("../configs/InraidConfig.json");

class InraidCallbacks
{
    static onLoad(sessionID)
    {
        return inraid_f.controller.onLoad(sessionID);
    }

    static registerPlayer(url, info, sessionID)
    {
        inraid_f.controller.addPlayer(sessionID, info);
        return https_f.response.nullResponse();
    }

    static saveProgress(url, info, sessionID)
    {
        inraid_f.controller.saveProgress(info, sessionID);
        return https_f.response.nullResponse();
    }

    static getRaidEndState()
    {
        return https_f.response.noBody(InraidConfig.MIAOnRaidEnd);
    }

    static getRaidMenuSettings(url, info, sessionID)
    {
        return https_f.response.noBody(InraidConfig.raidMenuSettings);
    }

    static getWeaponDurability(url, info, sessionID)
    {
        return https_f.response.noBody(InraidConfig.save.durability);
    }
}

module.exports = InraidCallbacks;
