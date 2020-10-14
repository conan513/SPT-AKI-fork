/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

const path = require("path");

class Controller
{
    constructor()
    {
        this.bundles = {};
        this.backendUrl = https_f.config.backendUrl;
    }

    // TODO: remove res global from use
    load()
    {
        for (const i in res.bundles)
        {
            if (!("manifest" in res.bundles[i]))
            {
                continue;
            }

            const manifestPath = res.bundles[i].manifest;
            const manifest = common_f.json.deserialize(common_f.vfs.readFile(manifestPath)).manifest;
            const  modName = res.bundles[i].manifest.split("/")[2];
            const manifestPathSplit = manifestPath.split("/");
            let bundleDir = "";

            if (manifestPathSplit[3] === "res"
            && manifestPathSplit[4] === "bundles"
            && manifestPathSplit[6] === "manifest.json")
            {
                bundleDir = `${modName}/res/bundles/${manifestPathSplit[5]}/`;
            }

            for (const j in manifest)
            {
                const info = manifest[j];
                const bundle = {
                    "key": info.key,
                    "path": `${this.backendUrl}/files/bundle/${info.key}`,
                    "filepath" : ("path" in info) ? info.path : `mods/${bundleDir}StreamingAssets/Windows/${info.key}`.replace(/\\/g, "/"),
                    "dependencyKeys": ("dependencyKeys" in info) ? info.dependencyKeys : []
                };

                this.bundles[info.key] = bundle;
            }
        }
    }

    getBundles(local)
    {
        let result = [];

        for (const bundle in this.bundles)
        {
            result.push(getBundle(bundle, local));
        }

        return result;
    }

    getBundle(key, local)
    {
        let bundle = helpfunc_f.helpFunctions.clone(this.bundles[key]);

        if (local)
        {
            bundle.path = bundle.filepath;
        }

        delete bundle.filepath;
        return bundle;
    }
}

module.exports.Controller = Controller;
