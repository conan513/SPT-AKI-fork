/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Controller
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

            if (info.email === account.email && info.password === account.password)
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
            if (info.email === save_f.server.profiles[sessionID].info.email)
            {
                return "";
            }
        }

        return this.createAccount(info);
    }

    createAccount(info)
    {
        const sessionID = utility.generateID();

        save_f.server.profiles[sessionID] = {
            "info": {
                "id": sessionID,
                "email": info.email,
                "password": info.password,
                "wipe": true,
                "edition": info.edition
            }
        };

        save_f.server.onLoadProfile(sessionID);
        save_f.server.onSaveProfile(sessionID);
        return sessionID;
    }

    changeEmail(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.server.profiles[sessionID].info.email = info.change;
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

module.exports.Controller = Controller;
