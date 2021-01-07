/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

class Callbacks
{
    constructor()
    {
        core_f.packager.onLoad["loadMods"] = this.load.bind(this);
        https_f.server.onRespond["BUNDLE"] = this.sendBundle.bind(this);
        https_f.router.onStaticRoute["/singleplayer/bundles"] = this.getBundles.bind(this);
        https_f.router.onDynamicRoute[".bundle"] = this.getBundle.bind(this);
    }

    load()
    {
        mods_f.loader.load();
    }

    sendBundle(sessionID, req, resp, body)
    {
        common_f.logger.logInfo(`[BUNDLE]: ${req.url}`);

        const key = req.url.split("/bundle/")[1];
        const bundle = mods_f.loader.getBundle(key, true);

        // send bundle
        https_f.server.sendFile(resp, bundle.path);
    }

    getBundles(url, info, sessionID)
    {
        const local = (https_f.config.ip === "127.0.0.1" || https_f.config.ip === "localhost");
        return https_f.response.noBody(mods_f.loader.getBundles(local));
    }

    getBundle(url, info, sessionID)
    {
        return "BUNDLE";
    }
}

module.exports.Callbacks = Callbacks;
