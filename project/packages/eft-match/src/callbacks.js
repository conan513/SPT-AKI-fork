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
        https_f.router.staticRoutes["/raid/profile/list"] = this.getProfile.bind(this);
        https_f.router.staticRoutes["/client/match/available"] = this.serverAvailable.bind(this);
        https_f.router.staticRoutes["/client/match/updatePing"] = this.updatePing.bind(this);
        https_f.router.staticRoutes["/client/match/join"] = this.joinMatch.bind(this);
        https_f.router.staticRoutes["/client/match/exit"] = this.exitMatch.bind(this);
        https_f.router.staticRoutes["/client/match/group/create"] = this.createGroup.bind(this);
        https_f.router.staticRoutes["/client/match/group/delete"] = this.deleteGroup.bind(this);
        https_f.router.staticRoutes["/client/match/group/status"] = this.getGroupStatus.bind(this);
        https_f.router.staticRoutes["/client/match/group/start_game"] = this.joinMatch.bind(this);
        https_f.router.staticRoutes["/client/match/group/exit_from_menu"] = this.exitToMenu.bind(this);
        https_f.router.staticRoutes["/client/match/group/looking/start"] = this.startGroupSearch.bind(this);
        https_f.router.staticRoutes["/client/match/group/looking/stop"] = this.stopGroupSearch.bind(this);
        https_f.router.staticRoutes["/client/match/group/invite/send"] = this.sendGroupInvite.bind(this);
        https_f.router.staticRoutes["/client/match/group/invite/accept"] = this.acceptGroupInvite.bind(this);
        https_f.router.staticRoutes["/client/match/group/invite/cancel"] = this.cancelGroupInvite.bind(this);
        https_f.router.staticRoutes["/client/putMetrics"] = this.putMetrics.bind(this);
        https_f.router.staticRoutes["/client/getMetricsConfig"] = this.getMetrics.bind(this);
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
        return common_f.json.serialize(database_f.server.tables.match.metrics);
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

module.exports.Callbacks = Callbacks;
