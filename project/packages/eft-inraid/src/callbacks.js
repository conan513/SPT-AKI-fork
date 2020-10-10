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
        save_f.server.onLoadCallback["inraid"] = this.onLoad.bind(this);
        router_f.router.staticRoutes["/raid/map/name"] = this.registerPlayer.bind(this);
        router_f.router.staticRoutes["/raid/profile/save"] = this.saveProgress.bind(this);
        router_f.router.staticRoutes["/singleplayer/settings/raid/endstate"] = this.getRaidEndState.bind(this);
        router_f.router.staticRoutes["/singleplayer/settings/weapon/durability"] = this.getWeaponDurability.bind(this);
        router_f.router.staticRoutes["/singleplayer/settings/raid/menu"] = this.getRaidMenuSettings.bind(this);
    }

    onLoad(sessionID)
    {
        return inraid_f.controller.onLoad(sessionID);
    }

    registerPlayer(url, info, sessionID)
    {
        inraid_f.controller.addPlayer(sessionID, info);
        return response_f.controller.nullResponse();
    }

    saveProgress(url, info, sessionID)
    {
        inraid_f.controller.saveProgress(info, sessionID);
        return response_f.controller.nullResponse();
    }

    getRaidEndState()
    {
        return response_f.controller.noBody(inraid_f.config.MIAOnRaidEnd);
    }

    getRaidMenuSettings(url, info, sessionID)
    {
        return response_f.controller.noBody(inraid_f.config.raidMenuSettings);
    }

    getWeaponDurability(url, info, sessionID)
    {
        return response_f.controller.noBody(inraid_f.config.save.durability);
    }
}

module.exports.Callbacks = Callbacks;
