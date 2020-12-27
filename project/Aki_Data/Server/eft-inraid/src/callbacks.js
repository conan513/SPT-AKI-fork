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
        save_f.server.onLoad["inraid"] = this.onLoad.bind(this);
        https_f.router.onStaticRoute["/raid/map/name"] = this.registerPlayer.bind(this);
        https_f.router.onStaticRoute["/raid/profile/save"] = this.saveProgress.bind(this);
        https_f.router.onStaticRoute["/singleplayer/settings/raid/endstate"] = this.getRaidEndState.bind(this);
        https_f.router.onStaticRoute["/singleplayer/settings/weapon/durability"] = this.getWeaponDurability.bind(this);
        https_f.router.onStaticRoute["/singleplayer/settings/raid/menu"] = this.getRaidMenuSettings.bind(this);
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

module.exports.Callbacks = Callbacks;
