/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const SaveServer = require("../servers/SaveServer.js");
const HashUtil = require("../utils/HashUtil.js");

class LauncherController
{
    static find(sessionID)
    {
        if (sessionID in SaveServer.profiles)
        {
            return SaveServer.profiles[sessionID].info;
        }

        return undefined;
    }

    static isWiped(sessionID)
    {
        return SaveServer.profiles[sessionID].info.wipe;
    }

    static login(info)
    {
        for (const sessionID in SaveServer.profiles)
        {
            const account = SaveServer.profiles[sessionID].info;
            if (info.username === account.username && info.password === account.password)
            {
                return sessionID;
            }
        }

        return "";
    }

    static register(info)
    {
        for (const sessionID in SaveServer.profiles)
        {
            if (info.username === SaveServer.profiles[sessionID].info.username)
            {
                return "";
            }
        }

        return LauncherController.createAccount(info);
    }

    static createAccount(info)
    {
        const sessionID = HashUtil.generate();

        SaveServer.profiles[sessionID] = {
            "info": {
                "id": sessionID,
                "username": info.username,
                "password": info.password,
                "wipe": true,
                "edition": info.edition
            }
        };

        SaveServer.loadProfile(sessionID);
        SaveServer.saveProfile(sessionID);
        return sessionID;
    }

    static changeUsername(info)
    {
        const sessionID = LauncherController.login(info);

        if (sessionID)
        {
            SaveServer.profiles[sessionID].info.username = info.change;
        }

        return sessionID;
    }

    static changePassword(info)
    {
        const sessionID = LauncherController.login(info);

        if (sessionID)
        {
            SaveServer.profiles[sessionID].info.password = info.change;
        }

        return sessionID;
    }

    static wipe(info)
    {
        const sessionID = LauncherController.login(info);

        if (sessionID)
        {
            SaveServer.profiles[sessionID].info.edition = info.edition;
            SaveServer.profiles[sessionID].info.wipe = true;
        }

        return sessionID;
    }
}

module.exports = LauncherController;
