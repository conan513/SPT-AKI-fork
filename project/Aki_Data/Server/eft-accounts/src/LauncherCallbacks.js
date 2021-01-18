/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class LauncherCallbacks
{
    constructor()
    {
        // TODO: REFACTOR THIS
        https_f.router.onStaticRoute["/launcher/server/connect"] = this.connect.bind(this);
        https_f.router.onStaticRoute["/launcher/profile/login"] = this.login.bind(this);
        https_f.router.onStaticRoute["/launcher/profile/register"] = this.register.bind(this);
        https_f.router.onStaticRoute["/launcher/profile/get"] = this.get.bind(this);
        https_f.router.onStaticRoute["/launcher/profile/change/username"] = this.changeUsername.bind(this);
        https_f.router.onStaticRoute["/launcher/profile/change/password"] = this.changePassword.bind(this);
        https_f.router.onStaticRoute["/launcher/profile/change/wipe"] = this.wipe.bind(this);
    }

    load()
    {
        account_f.controller.initialize();
    }

    // TODO: REFACTOR THIS
    connect()
    {
        return https_f.response.noBody({
            "backendUrl": https_f.config.backendUrl,
            "name": https_f.server.name,
            "editions": Object.keys(database_f.server.tables.templates.profiles)
        });
    }

    login(url, info, sessionID)
    {
        const output = account_f.controller.login(info);
        return (!output) ? "FAILED" : output;
    }

    register(url, info, sessionID)
    {
        const output = account_f.controller.register(info);
        return (!output) ? "FAILED" : "OK";
    }

    get(url, info, sessionID)
    {
        const output = account_f.controller.find(account_f.controller.login(info));
        return https_f.response.noBody(output);
    }

    changeUsername(url, info, sessionID)
    {
        const output = account_f.controller.changeUsername(info);
        return (!output) ? "FAILED" : "OK";
    }

    changePassword(url, info, sessionID)
    {
        const output = account_f.controller.changePassword(info);
        return (!output) ? "FAILED" : "OK";
    }

    wipe(url, info, sessionID)
    {
        const output = account_f.controller.wipe(info);
        return (!output) ? "FAILED" : "OK";
    }
}

module.exports.LauncherCallbacks = LauncherCallbacks;
