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
        router_f.router.staticRoutes["/launcher/server/connect"] = this.connect.bind(this);
        router_f.router.staticRoutes["/launcher/profile/login"] = this.login.bind(this);
        router_f.router.staticRoutes["/launcher/profile/register"] = this.register.bind(this);
        router_f.router.staticRoutes["/launcher/profile/get"] = this.get.bind(this);
        router_f.router.staticRoutes["/launcher/profile/change/email"] = this.changeEmail.bind(this);
        router_f.router.staticRoutes["/launcher/profile/change/password"] = this.changePassword.bind(this);
        router_f.router.staticRoutes["/launcher/profile/change/wipe"] = this.wipe.bind(this);
    }

    load()
    {
        account_f.controller.initialize();
    }

    // TODO: REFACTOR THIS
    connect()
    {
        return response_f.controller.noBody({
            "backendUrl": server_f.server.backendUrl,
            "name": server_f.server.name,
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
        return response_f.controller.noBody(output);
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
