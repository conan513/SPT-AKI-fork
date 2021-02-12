/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const DatabaseServer = require("../servers/DatabaseServer");
const LauncherController = require("../controllers/LauncherController.js");
const HttpConfig = require("../configs/HttpConfig.json");

class LauncherCallbacks
{
    static connect()
    {
        return https_f.response.noBody({
            "backendUrl": https_f.server.getBackendUrl(),
            "name": HttpConfig.name,
            "editions": Object.keys(DatabaseServer.tables.templates.profiles)
        });
    }

    static login(url, info, sessionID)
    {
        const output = LauncherController.login(info);
        return (!output) ? "FAILED" : output;
    }

    static register(url, info, sessionID)
    {
        const output = LauncherController.register(info);
        return (!output) ? "FAILED" : "OK";
    }

    static get(url, info, sessionID)
    {
        const output = LauncherController.find(LauncherController.login(info));
        return https_f.response.noBody(output);
    }

    static changeUsername(url, info, sessionID)
    {
        const output = LauncherController.changeUsername(info);
        return (!output) ? "FAILED" : "OK";
    }

    static changePassword(url, info, sessionID)
    {
        const output = LauncherController.changePassword(info);
        return (!output) ? "FAILED" : "OK";
    }

    static wipe(url, info, sessionID)
    {
        const output = LauncherController.wipe(info);
        return (!output) ? "FAILED" : "OK";
    }
}

module.exports = LauncherCallbacks;
