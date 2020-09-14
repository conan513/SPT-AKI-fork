"use strict";

/**
* AccountServer class maintains list of accounts in memory. All account information should be
* loaded during server init.
*/
class AccountServer
{
    find(sessionID)
    {
        for (let accountID in save_f.saveServer.accounts)
        {
            let account = save_f.saveServer.accounts[accountID];

            if (account.id === sessionID)
            {
                return account;
            }
        }

        return undefined;
    }

    isWiped(sessionID)
    {
        return save_f.saveServer.accounts[sessionID].wipe;
    }

    setWipe(sessionID, state)
    {
        save_f.saveServer.accounts[sessionID].wipe = state;
    }

    login(info)
    {
        for (let accountID in save_f.saveServer.accounts)
        {
            let account = save_f.saveServer.accounts[accountID];

            if (info.email === account.email && info.password === account.password)
            {
                return accountID;
            }
        }

        return "";
    }

    register(info)
    {
        for (let accountID in save_f.saveServer.accounts)
        {
            if (info.email === save_f.saveServer.accounts[accountID].email)
            {
                return accountID;
            }
        }

        let accountID = utility.generateNewAccountId();

        save_f.saveServer.accounts[accountID] = {
            "id": accountID,
            "nickname": "",
            "email": info.email,
            "password": info.password,
            "wipe": true,
            "edition": info.edition
        };

        save_f.saveServer.saveToDisk();
        return "";
    }

    remove(info)
    {
        let accountID = this.login(info);

        if (accountID !== "")
        {
            delete save_f.saveServer.accounts[accountID];
            utility.removeDir("user/profiles/" + accountID + "/");
            save_f.saveServer.saveToDisk();
        }

        return accountID;
    }

    changeEmail(info)
    {
        let accountID = this.login(info);

        if (accountID !== "")
        {
            save_f.saveServer.accounts[accountID].email = info.change;
            save_f.saveServer.saveToDisk();
        }

        return accountID;
    }

    changePassword(info)
    {
        let accountID = this.login(info);

        if (accountID !== "")
        {
            save_f.saveServer.accounts[accountID].password = info.change;
            save_f.saveServer.saveToDisk();
        }

        return accountID;
    }

    wipe(info)
    {
        let accountID = this.login(info);

        if (accountID !== "")
        {
            save_f.saveServer.accounts[accountID].edition = info.edition;
            this.setWipe(accountID, true);
            save_f.saveServer.saveToDisk();
        }

        return accountID;
    }

    getReservedNickname(sessionID)
    {
        return save_f.saveServer.accounts[sessionID].nickname;
    }

    nicknameTaken(info)
    {
        for (let accountID in save_f.saveServer.accounts)
        {
            if (info.nickname.toLowerCase() === save_f.saveServer.accounts[accountID].nickname.toLowerCase())
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
        router.addStaticRoute("/launcher/server/connect",          this.connect.bind());
        router.addStaticRoute("/launcher/profile/login",           this.login.bind());
        router.addStaticRoute("/launcher/profile/register",        this.register.bind());
        router.addStaticRoute("/launcher/profile/remove",          this.remove.bind());
        router.addStaticRoute("/launcher/profile/get",             this.get.bind());
        router.addStaticRoute("/launcher/profile/change/email",    this.changeEmail.bind());
        router.addStaticRoute("/launcher/profile/change/password", this.changePassword.bind());
        router.addStaticRoute("/launcher/profile/change/wipe",     this.wipe.bind());
    }

    load()
    {
        account_f.accountServer.initialize();
    }

    connect()
    {
        return json.stringify({
            "backendUrl": server.getBackendUrl(),
            "name": server.getName(),
            "editions": Object.keys(db.profile)
        });
    }

    login(url, info, sessionID)
    {
        let output = account_f.accountServer.login(info);
        return (output === "") ? "FAILED" : output;
    }

    register(url, info, sessionID)
    {
        let output = account_f.accountServer.register(info);
        return (output !== "") ? "FAILED" : "OK";
    }

    remove(url, info, sessionID)
    {
        let output = account_f.accountServer.remove(info);
        return (output === "") ? "FAILED" : "OK";
    }

    get(url, info, sessionID)
    {
        let accountId = account_f.accountServer.login(info);
        let output = account_f.accountServer.find(accountId);
        return json.stringify(output);
    }

    changeEmail(url, info, sessionID)
    {
        let output = account_f.accountServer.changeEmail(info);
        return (output === "") ? "FAILED" : "OK";
    }

    changePassword(url, info, sessionID)
    {
        let output = account_f.accountServer.changePassword(info);
        return (output === "") ? "FAILED" : "OK";
    }

    wipe(url, info, sessionID)
    {
        let output = account_f.accountServer.wipe(info);
        return (output === "") ? "FAILED" : "OK";
    }
}

module.exports.accountServer = new AccountServer();
module.exports.accountCallbacks = new AccountCallbacks();
