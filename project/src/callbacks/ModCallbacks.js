/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

const HttpConfig = require("../configs/HttpConfig.json");

class ModCallbacks
{
    static load()
    {
        Mods.load();
    }

    static sendBundle(sessionID, req, resp, body)
    {
        Logger.info(`[BUNDLE]: ${req.url}`);

        const key = req.url.split("/bundle/")[1];
        const bundle = Mods.getBundle(key, true);

        // send bundle
        https_f.server.sendFile(resp, bundle.path);
    }

    static getBundles(url, info, sessionID)
    {
        const local = (HttpConfig.ip === "127.0.0.1" || HttpConfig.ip === "localhost");
        return https_f.response.noBody(Mods.getBundles(local));
    }

    static getBundle(url, info, sessionID)
    {
        return "BUNDLE";
    }
}

module.exports = ModCallbacks;
