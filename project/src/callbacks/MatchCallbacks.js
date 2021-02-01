/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class MatchCallbacks
{
    friendRequest(url, request, sessionID)
    {
        return https_f.response.nullResponse();
    }

    updatePing(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    exitMatch(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    exitToMenu(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    startGroupSearch(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    stopGroupSearch(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    sendGroupInvite(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    acceptGroupInvite(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    cancelGroupInvite(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    putMetrics(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    getProfile(url, info, sessionID)
    {
        return https_f.response.getBody(match_f.controller.getProfile(info));
    }

    serverAvailable(url, info, sessionID)
    {
        let output = match_f.controller.getEnabled();

        if (output === false)
        {
            return https_f.response.getBody(null, 420, "Please play as PMC and go through the offline settings screen before pressing ready.");
        }

        return https_f.response.getBody(output);
    }

    joinMatch(url, info, sessionID)
    {
        return https_f.response.getBody(match_f.controller.joinMatch(info, sessionID));
    }

    getMetrics(url, info, sessionID)
    {
        return https_f.response.getBody(JsonUtil.serialize(database_f.server.tables.match.metrics));
    }

    getGroupStatus(url, info, sessionID)
    {
        return https_f.response.getBody(match_f.controller.getGroupStatus(info));
    }

    createGroup(url, info, sessionID)
    {
        return https_f.response.getBody(match_f.controller.createGroup(sessionID, info));
    }

    deleteGroup(url, info, sessionID)
    {
        match_f.controller.deleteGroup(info);
        return https_f.response.nullResponse();
    }
}

module.exports = new MatchCallbacks();
