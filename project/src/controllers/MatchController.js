/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const LauncherController = require("./LauncherController.js");
const MatchConfig = require("../configs/Matchconfig.js");
const TimeUtil = require("../utils/TimeUtil.js");

class MatchController
{
    /* static servers = {}; */
    static locations = {};

    /*
    static addServer(info)
    {
        for (let server in MatchController.servers)
        {
            if (MatchController.servers[server].id === info.id)
            {
                return "OK";
            }
        }

        MatchController.servers[info.id] = {"ip": info.ip, "port": info.port, "location": info.location};
        return "FAILED";
    }

    static removeServer(info)
    {
        delete MatchController.servers[info.id];
        return "OK";
    }
    */

    static getEnabled()
    {
        return MatchConfig.enabled;
    }

    static getProfile(info)
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

    static getMatch(location)
    {
        return {
            "id": "TEST",
            "ip": "127.0.0.1",
            "port": 9909
        };
    }

    static joinMatch(info, sessionID)
    {
        let match = MatchController.getMatch(info.location);
        let output = [];

        // --- LOOP (DO THIS FOR EVERY PLAYER IN GROUP)
        // get player profile
        let account = LauncherController.find(sessionID);
        let profileID = "";

        if (info.savage === true)
        {
            profileID = `scav${account.id}`;
        }
        else
        {
            profileID = `pmc${account.id}`;
        }

        // get list of players joining into the match
        output.push({
            "profileid": profileID,
            "status": "busy",
            "sid": "",
            "ip": match.ip,
            "port": match.port,
            "version": "live",
            "location": info.location,
            "gamemode": "deathmatch",
            "shortid": match.id
        });
        // ---

        return output;
    }

    static getGroupStatus(info)
    {
        return {
            "players": [],
            "invite": [],
            "group": []
        };
    }

    static createGroup(sessionID, info)
    {
        let groupID = "test";

        MatchController.locations[info.location].groups[groupID] = {
            "_id": groupID,
            "owner": `pmc${sessionID}`,
            "location": info.location,
            "gameVersion": "live",
            "region": "EUR",
            "status": "wait",
            "isSavage": false,
            "timeShift": "CURR",
            "dt": TimeUtil.getTimestamp(),
            "players": [
                {
                    "_id": `pmc${sessionID}`,
                    "region": "EUR",
                    "ip": "127.0.0.1",
                    "savageId": `scav${sessionID}`,
                    "accessKeyId": ""
                }
            ],
            "customDataCenter": []
        };

        return MatchController.locations[info.location].groups[groupID];
    }

    static deleteGroup(info)
    {
        for (let locationID in MatchController.locations)
        {
            for (let groupID in MatchController.locations[locationID].groups)
            {
                if (groupID === info.groupId)
                {
                    delete MatchController.locations[locationID].groups[groupID];
                    return;
                }
            }
        }
    }
}

module.exports = MatchController;
