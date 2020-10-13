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
        https_f.server.onStart["loadBundles"] = this.load.bind(this);
        https_f.server.onRespond["BUNDLE"] = this.sendBundle.bind(this);
        https_f.router.staticRoutes["/singleplayer/bundles"] = this.getBundles.bind(this);
        https_f.router.dynamicRoutes[".bundle"] = this.getBundle.bind(this);
    }

    load()
    {
        bundles_f.controller.initialize();
    }

    sendBundle(sessionID, req, resp, body)
    {
        common_f.logger.logInfo("[BUNDLE]:" + req.url);

        let bundleKey = req.url.split("/bundle/")[1];
        let bundle = bundles_f.controller.getBundleByKey(bundleKey, true);
        let path = bundle.path;

        // send bundle
        https_f.server.sendFile(resp, path);
    }

    getBundles(url, info, sessionID)
    {
        const local = (https_f.server.ip === "127.0.0.1" || https_f.server.ip === "localhost");
        return https_f.response.noBody(bundles_f.controller.getBundles(local));
    }

    getBundle(url, info, sessionID)
    {
        return "BUNDLE";
    }
}

module.exports.Callbacks = Callbacks;
