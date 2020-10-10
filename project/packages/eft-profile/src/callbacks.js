/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class Callbacks
{
    constructor()
    {
        save_f.server.onLoadCallback["profile"] = this.onLoad.bind(this);

        router_f.router.staticRoutes["/client/game/profile/create"] = this.createProfile.bind(this);
        router_f.router.staticRoutes["/client/game/profile/list"] = this.getProfileData.bind(this);
        router_f.router.staticRoutes["/client/game/profile/savage/regenerate"] = this.regenerateScav.bind(this);
        router_f.router.staticRoutes["/client/game/profile/voice/change"] = this.changeVoice.bind(this);
        router_f.router.staticRoutes["/client/game/profile/nickname/change"] = this.changeNickname.bind(this);
        router_f.router.staticRoutes["/client/game/profile/nickname/validate"] = this.validateNickname.bind(this);
        router_f.router.staticRoutes["/client/game/profile/nickname/reserved"] = this.getReservedNickname.bind(this);
    }

    onLoad(sessionID)
    {
        return profile_f.controller.onLoad(sessionID);
    }

    createProfile(url, info, sessionID)
    {
        profile_f.controller.createProfile(info, sessionID);
        return response_f.controller.getBody({"uid": "pmc" + sessionID});
    }

    getProfileData(url, info, sessionID)
    {
        return response_f.controller.getBody(profile_f.controller.getCompleteProfile(sessionID));
    }

    regenerateScav(url, info, sessionID)
    {
        return response_f.controller.getBody([profile_f.controller.generateScav(sessionID)]);
    }

    changeVoice(url, info, sessionID)
    {
        profile_f.controller.changeVoice(info, sessionID);
        return response_f.controller.nullResponse();
    }

    /// --- TODO: USE LOCALIZED STRINGS --- ///
    changeNickname(url, info, sessionID)
    {
        const output = profile_f.controller.changeNickname(info, sessionID);

        if (output === "taken")
        {
            return response_f.controller.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return response_f.controller.getBody(null, 1, "The nickname is too short");
        }

        return response_f.controller.getBody({"status": 0, "nicknamechangedate": Math.floor(new Date() / 1000)});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///
    validateNickname(url, info, sessionID)
    {
        const output = profile_f.controller.validateNickname(info, sessionID);

        if (output === "taken")
        {
            return response_f.controller.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return response_f.controller.getBody(null, 256, "The nickname is too short");
        }

        return response_f.controller.getBody({"status": "ok"});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///

    getReservedNickname(url, info, sessionID)
    {
        return response_f.controller.getBody("SPTarkov");
    }
}

module.exports.Callbacks = Callbacks;
