/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class ProfileCallbacks
{
    constructor()
    {
        save_f.server.onLoad["profile"] = this.onLoad.bind(this);
        https_f.router.addStaticRoute("/client/game/profile/create", "Aki", this.createProfile.bind(this));
        https_f.router.addStaticRoute("/client/game/profile/list", "Aki", this.getProfileData.bind(this));
        https_f.router.addStaticRoute("/client/game/profile/savage/regenerate", "Aki", this.regenerateScav.bind(this));
        https_f.router.addStaticRoute("/client/game/profile/nickname/change", "Aki", this.changeNickname.bind(this));
        https_f.router.addStaticRoute("/client/game/profile/nickname/validate", "Aki", this.validateNickname.bind(this));
        https_f.router.addStaticRoute("/client/game/profile/nickname/reserved", "Aki", this.getReservedNickname.bind(this));
        https_f.router.addStaticRoute("/client/profile/status", "Aki", this.getProfileStatus.bind(this));
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
            "nicknamechangedate": TimeUtil.getTimestamp()
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

    getProfileStatus(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "profileid": `scav${sessionID}`,
                "status": "Free",
                "sid": "",
                "ip": "",
                "port": 0
            },
            {
                "profileid": `pmc${sessionID}`,
                "status": "Free",
                "sid": "",
                "ip": "",
                "port": 0
            }
        ]);
    }
}

module.exports = new ProfileCallbacks();
