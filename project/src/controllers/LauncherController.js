/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class LauncherController
{
    find(sessionID)
    {
        if (sessionID in save_f.server.profiles)
        {
            return save_f.server.profiles[sessionID].info;
        }

        return undefined;
    }

    isWiped(sessionID)
    {
        return save_f.server.profiles[sessionID].info.wipe;
    }

    login(info)
    {
        for (const sessionID in save_f.server.profiles)
        {
            const account = save_f.server.profiles[sessionID].info;

            if (info.username === account.username && info.password === account.password)
            {
                return sessionID;
            }
        }

        return "";
    }

    register(info)
    {
        for (const sessionID in save_f.server.profiles)
        {
            if (info.username === save_f.server.profiles[sessionID].info.username)
            {
                return "";
            }
        }

        return this.createAccount(info);
    }

    createAccount(info)
    {
        const sessionID = HashUtil.generate();

        save_f.server.profiles[sessionID] = {
            "info": {
                "id": sessionID,
                "username": info.username,
                "password": info.password,
                "wipe": true,
                "edition": info.edition
            }
        };

        save_f.server.loadProfile(sessionID);
        save_f.server.saveProfile(sessionID);
        return sessionID;
    }

    changeUsername(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.server.profiles[sessionID].info.username = info.change;
        }

        return sessionID;
    }

    changePassword(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.server.profiles[sessionID].info.password = info.change;
        }

        return sessionID;
    }

    wipe(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.server.profiles[sessionID].info.edition = info.edition;
            save_f.server.profiles[sessionID].info.wipe = true;
        }

        return sessionID;
    }
}

module.exports = new LauncherController();
