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
    static connect()
    {
        return https_f.response.noBody({
            "backendUrl": https_f.server.getBackendUrl(),
            "name": https_f.config.name,
            "editions": Object.keys(database_f.server.tables.templates.profiles)
        });
    }

    static login(url, info, sessionID)
    {
        const output = account_f.controller.login(info);
        return (!output) ? "FAILED" : output;
    }

    static register(url, info, sessionID)
    {
        const output = account_f.controller.register(info);
        return (!output) ? "FAILED" : "OK";
    }

    static get(url, info, sessionID)
    {
        const output = account_f.controller.find(account_f.controller.login(info));
        return https_f.response.noBody(output);
    }

    static changeUsername(url, info, sessionID)
    {
        const output = account_f.controller.changeUsername(info);
        return (!output) ? "FAILED" : "OK";
    }

    static changePassword(url, info, sessionID)
    {
        const output = account_f.controller.changePassword(info);
        return (!output) ? "FAILED" : "OK";
    }

    static wipe(url, info, sessionID)
    {
        const output = account_f.controller.wipe(info);
        return (!output) ? "FAILED" : "OK";
    }
}

module.exports = LauncherCallbacks;
