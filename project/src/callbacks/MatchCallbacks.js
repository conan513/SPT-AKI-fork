/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const MatchController = require("../controllers/MatchController.js");

class MatchCallbacks
{
    static updatePing(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static exitMatch(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static exitToMenu(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static startGroupSearch(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static stopGroupSearch(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static sendGroupInvite(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static acceptGroupInvite(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static cancelGroupInvite(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static putMetrics(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static getProfile(url, info, sessionID)
    {
        return https_f.response.getBody(MatchController.getProfile(info));
    }

    static serverAvailable(url, info, sessionID)
    {
        let output = MatchController.getEnabled();

        if (output === false)
        {
            return https_f.response.getBody(null, 420, "Please play as PMC and go through the offline settings screen before pressing ready.");
        }

        return https_f.response.getBody(output);
    }

    static joinMatch(url, info, sessionID)
    {
        return https_f.response.getBody(MatchController.joinMatch(info, sessionID));
    }

    static getMetrics(url, info, sessionID)
    {
        return https_f.response.getBody(JsonUtil.serialize(database_f.server.tables.match.metrics));
    }

    static getGroupStatus(url, info, sessionID)
    {
        return https_f.response.getBody(MatchController.getGroupStatus(info));
    }

    static createGroup(url, info, sessionID)
    {
        return https_f.response.getBody(MatchController.createGroup(sessionID, info));
    }

    static deleteGroup(url, info, sessionID)
    {
        MatchController.deleteGroup(info);
        return https_f.response.nullResponse();
    }
}

module.exports = MatchCallbacks;
