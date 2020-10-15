/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 * - Terkoiz
 */

"use strict";

class Controller
{
    constructor()
    {
        this.bundles = {};
    }

    load()
    {
        for (const mod in core_f.packager.mods)
        {
            const modPath = core_f.packager.getModPath(mod);
            const manifestPath = `${modPath}bundles.json`;
            if (!common_f.vfs.exists(manifestPath))
            {
                continue;
            }

            const manifest = common_f.json.deserialize(common_f.vfs.readFile(manifestPath)).manifest;
            for (const bundleInfo of manifest)
            {
                const bundle = {
                    "key": bundleInfo.key,
                    "path": `${https_f.config.backendUrl}/files/bundle/${bundleInfo.key}`,
                    "filepath" : ("path" in bundleInfo)
                        ? bundleInfo.path
                        : `${process.cwd()}/${modPath}bundles/${bundleInfo.key}`.replace(/\\/g, "/"),
                    "dependencyKeys": ("dependencyKeys" in bundleInfo) ? bundleInfo.dependencyKeys : []
                };

                this.bundles[bundleInfo.key] = bundle;
            }
        }
    }

    getBundles(local)
    {
        const result = [];

        for (const bundle in this.bundles)
        {
            result.push(this.getBundle(bundle, local));
        }

        return result;
    }

    getBundle(key, local)
    {
        const bundle = helpfunc_f.helpFunctions.clone(this.bundles[key]);

        if (local)
        {
            bundle.path = bundle.filepath;
        }

        delete bundle.filepath;
        return bundle;
    }
}

module.exports.Controller = Controller;
