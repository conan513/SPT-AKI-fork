/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class InraidCallbacks
{
    onLoad(sessionID)
    {
        return inraid_f.controller.onLoad(sessionID);
    }

    registerPlayer(url, info, sessionID)
    {
        inraid_f.controller.addPlayer(sessionID, info);
        return https_f.response.nullResponse();
    }

    saveProgress(url, info, sessionID)
    {
        inraid_f.controller.saveProgress(info, sessionID);
        return https_f.response.nullResponse();
    }

    getRaidEndState()
    {
        return https_f.response.noBody(inraid_f.config.MIAOnRaidEnd);
    }

    getRaidMenuSettings(url, info, sessionID)
    {
        return https_f.response.noBody(inraid_f.config.raidMenuSettings);
    }

    getWeaponDurability(url, info, sessionID)
    {
        return https_f.response.noBody(inraid_f.config.save.durability);
    }
}

module.exports = new InraidCallbacks();
