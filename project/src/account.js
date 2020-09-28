/* account.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

/**
* AccountServer class maintains list of accounts in memory. All account information should be
* loaded during server init.
*/
class AccountServer
{
    find(sessionID)
    {
        if (sessionID in save_f.saveServer.profiles)
        {
            return save_f.saveServer.profiles[sessionID].info;
        }

        return undefined;
    }

    isWiped(sessionID)
    {
        return save_f.saveServer.profiles[sessionID].info.wipe;
    }

    setWipe(sessionID, state)
    {
        save_f.saveServer.profiles[sessionID].info.wipe = state;
    }

    login(info)
    {
        for (let sessionID in save_f.saveServer.profiles)
        {
            let account = save_f.saveServer.profiles[sessionID].info;

            if (info.email === account.email && info.password === account.password)
            {
                return sessionID;
            }
        }

        return "";
    }

    register(info)
    {
        for (const sessionID in save_f.saveServer.profiles)
        {
            if (info.email === save_f.saveServer.profiles[sessionID].info.email)
            {
                return "";
            }
        }

        return this.createAccount(info);
    }

    createAccount(info)
    {
        const sessionID = utility.generateNewAccountId();
        
        save_f.saveServer.profiles[sessionID] = {
            "info": {
                "id": sessionID,
                "nickname": "",
                "email": info.email,
                "password": info.password,
                "wipe": true,
                "edition": info.edition
            }
        };

        save_f.saveServer.onLoadProfile(sessionID);
        return sessionID;
    }

    changeEmail(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.saveServer.profiles[sessionID].info.email = info.change;
        }

        return sessionID;
    }

    changePassword(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.saveServer.profiles[sessionID].info.password = info.change;
        }

        return sessionID;
    }

    wipe(info)
    {
        const sessionID = this.login(info);

        if (sessionID)
        {
            save_f.saveServer.profiles[sessionID].info.edition = info.edition;
            this.setWipe(sessionID, true);
        }

        return sessionID;
    }

    getReservedNickname(sessionID)
    {
        return save_f.saveServer.profiles[sessionID].info.nickname;
    }

    nicknameTaken(info)
    {
        for (let sessionID in save_f.saveServer.profiles)
        {
            if (info.nickname.toLowerCase() === save_f.saveServer.profiles[sessionID].info.nickname.toLowerCase())
            {
                return true;
            }
        }

        return false;
    }
}

class AccountCallbacks
{
    constructor()
    {
        // TODO: REFACTOR THIS
        router.addStaticRoute("/launcher/server/connect",          this.connect.bind());

        router.addStaticRoute("/launcher/profile/login",           this.login.bind());
        router.addStaticRoute("/launcher/profile/register",        this.register.bind());
        router.addStaticRoute("/launcher/profile/get",             this.get.bind());
        router.addStaticRoute("/launcher/profile/change/email",    this.changeEmail.bind());
        router.addStaticRoute("/launcher/profile/change/password", this.changePassword.bind());
        router.addStaticRoute("/launcher/profile/change/wipe",     this.wipe.bind());
    }

    load()
    {
        account_f.accountServer.initialize();
    }

    // TODO: REFACTOR THIS
    connect()
    {
        return response_f.responseController.noBody({
            "backendUrl": server.getBackendUrl(),
            "name": server.getName(),
            "editions": Object.keys(db.profile)
        });
    }

    login(url, info, sessionID)
    {
        const output = account_f.accountServer.login(info);
        return (!output) ? "FAILED" : output;
    }

    register(url, info, sessionID)
    {
        const output = account_f.accountServer.register(info);
        return (!output) ? "FAILED" : "OK";
    }

    get(url, info, sessionID)
    {
        const output = account_f.accountServer.find(account_f.accountServer.login(info));
        return response_f.responseController.noBody(output);
    }

    changeEmail(url, info, sessionID)
    {
        const output = account_f.accountServer.changeEmail(info);
        return (!output) ? "FAILED" : "OK";
    }

    changePassword(url, info, sessionID)
    {
        const output = account_f.accountServer.changePassword(info);
        return (!output) ? "FAILED" : "OK";
    }

    wipe(url, info, sessionID)
    {
        const output = account_f.accountServer.wipe(info);
        return (!output) ? "FAILED" : "OK";
    }
}

module.exports.accountServer = new AccountServer();
module.exports.accountCallbacks = new AccountCallbacks();
