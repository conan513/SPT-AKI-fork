/* match.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Controller
{
    constructor()
    {
        /* this.servers = {}; */
        this.locations = {};
    }

    /*
    addServer(info) {
        for (let server in this.servers) {
            if (this.servers[server].id === info.id) {
                return "OK";
            }
        }

        this.servers[info.id] = {"ip": info.ip, "port": info.port, "location": info.location};
        return "FAILED";
    }

    removeServer(info) {
        delete this.servers[info.id];
        return "OK";
    }
*/

    getEnabled()
    {
        return match_f.config.enabled;
    }

    getProfile(info)
    {
        if (info.profileId.includes("pmcAID"))
        {
            return profile_f.controller.getCompleteProfile(info.profileId.replace("pmcAID", "AID"));
        }

        if (info.profileId.includes("scavAID"))
        {
            return profile_f.controller.getCompleteProfile(info.profileId.replace("scavAID", "AID"));
        }

        return null;
    }

    getMatch(location)
    {
        return {"id": "TEST", "ip": "127.0.0.1", "port": 9909};
    }

    joinMatch(info, sessionID)
    {
        let match = this.getMatch(info.location);
        let output = [];

        // --- LOOP (DO THIS FOR EVERY PLAYER IN GROUP)
        // get player profile
        let account = account_f.server.find(sessionID);
        let profileID = "";

        if (info.savage === true)
        {
            profileID = "scav" + account.id;
        }
        else
        {
            profileID = "pmc" + account.id;
        }

        // get list of players joining into the match
        output.push({"profileid": profileID, "status": "busy", "sid": "", "ip": match.ip, "port": match.port, "version": "live", "location": info.location, "gamemode": "deathmatch", "shortid": match.id});
        // ---

        return output;
    }

    getGroupStatus(info)
    {
        return {"players": [], "invite": [], "group": []};
    }

    createGroup(sessionID, info)
    {
        let groupID = "test";

        this.locations[info.location].groups[groupID] = {"_id": groupID, "owner": "pmc" + sessionID, "location": info.location, "gameVersion": "live", "region": "EUR", "status": "wait", "isSavage": false, "timeShift": "CURR", "dt": utility.getTimestamp(), "players": [{"_id": "pmc" + sessionID, "region": "EUR", "ip": "127.0.0.1", "savageId": "scav" + sessionID, "accessKeyId": ""}], "customDataCenter": []};
        return this.locations[info.location].groups[groupID];
    }

    deleteGroup(info)
    {
        for (let locationID in this.locations)
        {
            for (let groupID in this.locations[locationID].groups)
            {
                if (groupID === info.groupId)
                {
                    delete this.locations[locationID].groups[groupID];
                    return;
                }
            }
        }
    }
}

class Callbacks
{
    constructor()
    {
        router.addStaticRoute("/raid/profile/list", this.getProfile.bind());
        router.addStaticRoute("/client/match/available", this.serverAvailable.bind());
        router.addStaticRoute("/client/match/updatePing", this.updatePing());
        router.addStaticRoute("/client/match/join", this.joinMatch.bind());
        router.addStaticRoute("/client/match/exit", this.exitMatch());
        router.addStaticRoute("/client/match/group/create", this.createGroup.bind());
        router.addStaticRoute("/client/match/group/delete", this.deleteGroup.bind());
        router.addStaticRoute("/client/match/group/status", this.getGroupStatus.bind());
        router.addStaticRoute("/client/match/group/start_game", this.joinMatch.bind());
        router.addStaticRoute("/client/match/group/exit_from_menu", this.exitToMenu.bind());
        router.addStaticRoute("/client/match/group/looking/start", this.startGroupSearch());
        router.addStaticRoute("/client/match/group/looking/stop", this.stopGroupSearch.bind());
        router.addStaticRoute("/client/match/group/invite/send", this.sendGroupInvite());
        router.addStaticRoute("/client/match/group/invite/accept", this.acceptGroupInvite());
        router.addStaticRoute("/client/match/group/invite/cancel", this.cancelGroupInvite());
        router.addStaticRoute("/client/putMetrics", this.putMetrics.bind());
        router.addStaticRoute("/client/getMetricsConfig", this.getMetrics.bind());
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
        return json.read(db.others.metrics);
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

class Config
{
    constructor()
    {
        this.enabled = false;
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
