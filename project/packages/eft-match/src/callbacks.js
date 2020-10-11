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
        router_f.router.staticRoutes["/raid/profile/list"] = this.getProfile.bind(this);
        router_f.router.staticRoutes["/client/match/available"] = this.serverAvailable.bind(this);
        router_f.router.staticRoutes["/client/match/updatePing"] = this.updatePing.bind(this);
        router_f.router.staticRoutes["/client/match/join"] = this.joinMatch.bind(this);
        router_f.router.staticRoutes["/client/match/exit"] = this.exitMatch.bind(this);
        router_f.router.staticRoutes["/client/match/group/create"] = this.createGroup.bind(this);
        router_f.router.staticRoutes["/client/match/group/delete"] = this.deleteGroup.bind(this);
        router_f.router.staticRoutes["/client/match/group/status"] = this.getGroupStatus.bind(this);
        router_f.router.staticRoutes["/client/match/group/start_game"] = this.joinMatch.bind(this);
        router_f.router.staticRoutes["/client/match/group/exit_from_menu"] = this.exitToMenu.bind(this);
        router_f.router.staticRoutes["/client/match/group/looking/start"] = this.startGroupSearch.bind(this);
        router_f.router.staticRoutes["/client/match/group/looking/stop"] = this.stopGroupSearch.bind(this);
        router_f.router.staticRoutes["/client/match/group/invite/send"] = this.sendGroupInvite.bind(this);
        router_f.router.staticRoutes["/client/match/group/invite/accept"] = this.acceptGroupInvite.bind(this);
        router_f.router.staticRoutes["/client/match/group/invite/cancel"] = this.cancelGroupInvite.bind(this);
        router_f.router.staticRoutes["/client/putMetrics"] = this.putMetrics.bind(this);
        router_f.router.staticRoutes["/client/getMetricsConfig"] = this.getMetrics.bind(this);
    }

    updatePing(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    exitMatch(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    exitToMenu(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    startGroupSearch(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    stopGroupSearch(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    sendGroupInvite(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    acceptGroupInvite(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    cancelGroupInvite(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    putMetrics(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    getProfile(url, info, sessionID)
    {
        return response_f.controller.getBody(match_f.controller.getProfile(info));
    }

    serverAvailable(url, info, sessionID)
    {
        let output = match_f.controller.getEnabled();

        if (output === false)
        {
            return response_f.controller.getBody(null, 420, "Please play as PMC and go through the offline settings screen before pressing ready.");
        }

        return response_f.controller.getBody(output);
    }

    joinMatch(url, info, sessionID)
    {
        return response_f.controller.getBody(match_f.controller.joinMatch(info, sessionID));
    }

    getMetrics(url, info, sessionID)
    {
        return json_f.instance.read(db.others.metrics);
    }

    getGroupStatus(url, info, sessionID)
    {
        return response_f.controller.getBody(match_f.controller.getGroupStatus(info));
    }

    createGroup(url, info, sessionID)
    {
        return response_f.controller.getBody(match_f.controller.createGroup(sessionID, info));
    }

    deleteGroup(url, info, sessionID)
    {
        match_f.controller.deleteGroup(info);
        return response_f.controller.nullResponse();
    }
}

module.exports.Callbacks = Callbacks;
