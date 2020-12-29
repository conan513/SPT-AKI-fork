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
        save_f.server.onLoad["profile"] = this.onLoad.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/create"] = this.createProfile.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/list"] = this.getProfileData.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/savage/regenerate"] = this.regenerateScav.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/nickname/change"] = this.changeNickname.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/nickname/validate"] = this.validateNickname.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/nickname/reserved"] = this.getReservedNickname.bind(this);
    }

    onLoad(sessionID)
    {
        return profile_f.controller.onLoad(sessionID);
    }

    createProfile(url, info, sessionID)
    {
        profile_f.controller.createProfile(info, sessionID);
        return https_f.response.getBody({"uid": `pmc${sessionID}`});
    }

    getProfileData(url, info, sessionID)
    {
        return https_f.response.getBody(profile_f.controller.getCompleteProfile(sessionID));
    }

    regenerateScav(url, info, sessionID)
    {
        return https_f.response.getBody([profile_f.controller.generateScav(sessionID)]);
    }

    /// --- TODO: USE LOCALIZED STRINGS --- ///
    changeNickname(url, info, sessionID)
    {
        const output = profile_f.controller.changeNickname(info, sessionID);

        if (output === "taken")
        {
            return https_f.response.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return https_f.response.getBody(null, 1, "The nickname is too short");
        }

        return https_f.response.getBody({
            "status": 0,
            "nicknamechangedate": common_f.time.getTimestamp()
        });
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///
    validateNickname(url, info, sessionID)
    {
        const output = profile_f.controller.validateNickname(info, sessionID);

        if (output === "taken")
        {
            return https_f.response.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return https_f.response.getBody(null, 256, "The nickname is too short");
        }

        return https_f.response.getBody({"status": "ok"});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///

    getReservedNickname(url, info, sessionID)
    {
        return https_f.response.getBody("SPTarkov");
    }
}

module.exports.Callbacks = Callbacks;
