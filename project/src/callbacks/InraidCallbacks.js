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
    constructor()
    {
        save_f.server.onLoad["inraid"] = this.onLoad.bind(this);
        https_f.router.addStaticRoute("/raid/map/name", "Aki", this.registerPlayer.bind(this));
        https_f.router.addStaticRoute("/raid/profile/save", "Aki", this.saveProgress.bind(this));
        https_f.router.addStaticRoute("/singleplayer/settings/raid/endstate", "Aki", this.getRaidEndState.bind(this));
        https_f.router.addStaticRoute("/singleplayer/settings/weapon/durability", "Aki", this.getWeaponDurability.bind(this));
        https_f.router.addStaticRoute("/singleplayer/settings/raid/menu", "Aki", this.getRaidMenuSettings.bind(this));
    }

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
