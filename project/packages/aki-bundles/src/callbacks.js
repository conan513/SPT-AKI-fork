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
        server_f.server.startCallback["loadBundles"] = this.load.bind(this);
        server_f.server.respondCallback["BUNDLE"] = this.sendBundle.bind(this);
        router_f.router.staticRoutes["/singleplayer/bundles"] = this.getBundles.bind(this);
        router_f.router.dynamicRoutes[".bundle"] = this.getBundle.bind(this);
    }

    load()
    {
        bundles_f.controller.initialize();
    }

    sendBundle(sessionID, req, resp, body)
    {
        logger_f.instance.logInfo("[BUNDLE]:" + req.url);

        let bundleKey = req.url.split("/bundle/")[1];
        let bundle = bundles_f.controller.getBundleByKey(bundleKey, true);
        let path = bundle.path;

        // send bundle
        server_f.server.sendFile(resp, path);
    }

    getBundles(url, info, sessionID)
    {
        const local = (server_f.server.ip === "127.0.0.1" || server_f.server.ip === "localhost");
        return response_f.controller.noBody(bundles_f.controller.getBundles(local));
    }

    getBundle(url, info, sessionID)
    {
        return "BUNDLE";
    }
}

module.exports.Callbacks = Callbacks;
