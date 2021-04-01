/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

const HttpConfig = require("../configs/Httpconfig.js");
const HttpResponse = require("../utils/HttpResponse");
const Logger = require("../utils/Logger");
const HttpServer = require("../servers/HttpServer.js");

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
        HttpServer.sendFile(resp, bundle.path);
    }

    static getBundles(url, info, sessionID)
    {
        const local = (HttpConfig.ip === "127.0.0.1" || HttpConfig.ip === "localhost");
        return HttpResponse.noBody(Mods.getBundles(local));
    }

    static getBundle(url, info, sessionID)
    {
        return "BUNDLE";
    }
}

module.exports = ModCallbacks;
