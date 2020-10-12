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
        // TODO: REFACTOR THIS
        https_f.router.staticRoutes["/launcher/server/connect"] = this.connect.bind(this);
        https_f.router.staticRoutes["/launcher/profile/login"] = this.login.bind(this);
        https_f.router.staticRoutes["/launcher/profile/register"] = this.register.bind(this);
        https_f.router.staticRoutes["/launcher/profile/get"] = this.get.bind(this);
        https_f.router.staticRoutes["/launcher/profile/change/email"] = this.changeEmail.bind(this);
        https_f.router.staticRoutes["/launcher/profile/change/password"] = this.changePassword.bind(this);
        https_f.router.staticRoutes["/launcher/profile/change/wipe"] = this.wipe.bind(this);
    }

    load()
    {
        account_f.controller.initialize();
    }

    // TODO: REFACTOR THIS
    connect()
    {
        return https_f.response.noBody({
            "backendUrl": https_f.server.backendUrl,
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

    changeEmail(url, info, sessionID)
    {
        const output = account_f.controller.changeEmail(info);
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

module.exports.Callbacks = Callbacks;
