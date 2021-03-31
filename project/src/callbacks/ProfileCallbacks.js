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
const TimeUtil = require("../utils/TimeUtil");

class ProfileCallbacks
{
    static onLoad(sessionID)
    {
        return profile_f.controller.onLoad(sessionID);
    }

    static createProfile(url, info, sessionID)
    {
        profile_f.controller.createProfile(info, sessionID);
        return HttpResponse.getBody({"uid": `pmc${sessionID}`});
    }

    static getProfileData(url, info, sessionID)
    {
        return HttpResponse.getBody(profile_f.controller.getCompleteProfile(sessionID));
    }

    static regenerateScav(url, info, sessionID)
    {
        return HttpResponse.getBody([profile_f.controller.generateScav(sessionID)]);
    }

    static changeNickname(url, info, sessionID)
    {
        const output = profile_f.controller.changeNickname(info, sessionID);

        if (output === "taken")
        {
            return HttpResponse.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return HttpResponse.getBody(null, 1, "The nickname is too short");
        }

        return HttpResponse.getBody({
            "status": 0,
            "nicknamechangedate": TimeUtil.getTimestamp()
        });
    }

    static validateNickname(url, info, sessionID)
    {
        const output = profile_f.controller.validateNickname(info, sessionID);

        if (output === "taken")
        {
            return HttpResponse.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return HttpResponse.getBody(null, 256, "The nickname is too short");
        }

        return HttpResponse.getBody({"status": "ok"});
    }

    static getReservedNickname(url, info, sessionID)
    {
        return HttpResponse.getBody("SPTarkov");
    }

    static getProfileStatus(url, info, sessionID)
    {
        return HttpResponse.getBody([
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

module.exports = ProfileCallbacks;
