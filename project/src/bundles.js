/* bundles.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

const path = require("path");

class BundleServer
{
    constructor()
    {
        this.bundles = [];
        this.bundleBykey = {};
        this.backendUrl = `https://${server.ip}:${server.port}`;
    }

    initialize(sessionID)
    {
        for (const i in res.bundles)
        {
            if (!("manifest" in res.bundles[i]))
            {
                continue;
            }

            let manifestPath = res.bundles[i].manifest;
            let manifest = json.parse(json.read(manifestPath)).manifest;
            let modName = res.bundles[i].manifest.split("/")[2];
            let bundleDir = "";
            let manifestPathSplit = manifestPath.split("/");

            if (manifestPathSplit[3] === "res"
            && manifestPathSplit[4] === "bundles"
            && manifestPathSplit[6] === "manifest.json")
            {
                bundleDir = `${modName}/res/bundles/${manifestPathSplit[5]}/`;
            }

            for (const j in manifest)
            {
                let info = manifest[j];
                let dependencyKeys = ("dependencyKeys" in info) ? info.dependencyKeys : [];
                let httpPath = this.getHttpPath(info.key);
                let filePath = ("path" in info) ? info.path : this.getFilePath(bundleDir, info.key);
                let bundle = {
                    "key": info.key,
                    "path": httpPath,
                    "filePath" : filePath,
                    "dependencyKeys": dependencyKeys
                };

                this.bundles.push(bundle);
                this.bundleBykey[info.key] = bundle;
            }
        }
    }

    getBundles(local)
    {
        let bundles = helpfunc_f.helpFunctions.clone(this.bundles);

        for (const bundle of bundles)
        {
            if (local)
            {
                bundle.path = bundle.filePath;
            }

            delete bundle.filePath;
        }

        return bundles;
    }

    getBundleByKey(key, local)
    {
        let bundle = helpfunc_f.helpFunctions.clone(this.bundleBykey[key]);

        if (local)
        {
            bundle.path = bundle.filePath;
        }

        delete bundle.filePath;
        return bundle;
    }

    getFilePath(bundleDir, key)
    {
        return `${path.join(__dirname).split("src")[0]}user/mods/${bundleDir}StreamingAssets/Windows/${key}`.replace(/\\/g, "/");
    }

    getHttpPath(key)
    {
        return `${this.backendUrl}/files/bundle/${key}`;
    }
}

class BundleCallbacks
{
    constructor()
    {
        server.addStartCallback("loadBundles", this.load.bind());
        server.addRespondCallback("BUNDLE", this.sendBundle.bind());
        router.addStaticRoute("/singleplayer/bundles/", this.getBundles.bind());
        router.addDynamicRoute(".bundle", this.getBundle.bind());
    }

    load()
    {
        bundles_f.bundleServer.initialize();
    }

    sendBundle(sessionID, req, resp, body)
    {
        logger.logInfo("[BUNDLE]:" + req.url);

        let bundleKey = req.url.split("/bundle/")[1];
        let bundle = bundles_f.bundleServer.getBundleByKey(bundleKey, true);
        let path = bundle.path;

        // send bundle
        server.sendFile(resp, path);
    }

    getBundles(url, info, sessionID)
    {
        const local = (server.ip === "127.0.0.1" || server.ip === "localhost");
        return response_f.responseController.noBody(bundles_f.bundleServer.getBundles(local));
    }

    getBundle(url, info, sessionID)
    {
        return "BUNDLE";
    }
}

module.exports.bundleServer = new BundleServer();
module.exports.bundleCallbacks = new BundleCallbacks();
