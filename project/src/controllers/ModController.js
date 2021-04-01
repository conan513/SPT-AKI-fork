/* loader.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const JsonUtil = require("../utils/JsonUtil");
const Logger = require("../utils/Logger");
const VFS = require("../utils/VFS");

class ModController
{
    static basepath = "user/mods/";
    static imported = {};
    static bundles = {};
    static onLoad = {};

    static load()
    {
        ModController.importMods();
        ModController.executeMods();
    }

    static importClass(name, filepath)
    {
        // import class
        global[name] = require(`../../${filepath}`);
    }

    static importMods()
    {
        // get mods
        if (!VFS.exists(ModController.basepath))
        {
            // no mods folder found
            VFS.createDir(ModController.basepath);
            return;
        }

        Logger.log("ModLoader: loading mods...");
        const mods = VFS.getDirs(ModController.basepath);

        // validate mods
        for (const mod of mods)
        {
            if (!ModController.validMod(mod))
            {
                Logger.error("Invalid mod encountered");
                return;
            }
        }

        // add mods
        for (const mod of mods)
        {
            ModController.addMod(mod);
        }
    }

    static executeMods()
    {
        // sort mods load order
        const source = Object.keys(ModController.getLoadOrder(ModController.imported));

        // import mod classes
        for (const mod of source)
        {
            if ("main" in ModController.imported[mod])
            {
                ModController.importClass(mod, `${ModController.getModPath(mod)}${ModController.imported[mod].main}`);
            }
        }

        // load mods
        for (const mod in ModController.onLoad)
        {
            ModController.onLoad[mod]();
        }
    }

    static getModPath(mod)
    {
        return `${ModController.basepath}${mod}/`;
    }

    static getBundles(local)
    {
        const result = [];

        for (const bundle in ModController.bundles)
        {
            result.push(ModController.getBundle(bundle, local));
        }

        return result;
    }

    static getBundle(key, local)
    {
        const bundle = JsonUtil.clone(ModController.bundles[key]);

        if (local)
        {
            bundle.path = bundle.filepath;
        }

        delete bundle.filepath;
        return bundle;
    }

    static addBundles(modpath)
    {
        const manifest = JsonUtil.deserialize(VFS.readFile(`${modpath}bundles.json`)).manifest;

        for (const bundleInfo of manifest)
        {
            const bundle = {
                "key": bundleInfo.key,
                "path": `${https_f.server.getBackendUrl()}/files/bundle/${bundleInfo.key}`,
                "filepath" : ("path" in bundleInfo)
                    ? bundleInfo.path
                    : `${process.cwd()}/${modpath}bundles/${bundleInfo.key}`.replace(/\\/g, "/"),
                "dependencyKeys": ("dependencyKeys" in bundleInfo) ? bundleInfo.dependencyKeys : []
            };

            ModController.bundles[bundleInfo.key] = bundle;
        }
    }

    static addMod(mod)
    {
        const modpath = ModController.getModPath(mod);

        // add mod to imported list
        ModController.imported[mod] = JsonUtil.deserialize(VFS.readFile(`${modpath}/package.json`));

        // add mod bundles
        if (VFS.exists(`${modpath}bundles.json`))
        {
            ModController.addBundles(modpath);
        }
    }

    static validMod(mod)
    {
        // check if config exists
        if (!VFS.exists(`${ModController.getModPath(mod)}/package.json`))
        {
            console.log(`Mod ${mod} is missing package.json`);
            return false;
        }

        // validate mod
        const config = JsonUtil.deserialize(VFS.readFile(`${ModController.getModPath(mod)}/package.json`));
        const checks = ["name", "author", "version", "license"];
        let issue = false;

        for (const check of checks)
        {
            if (!(check in config))
            {
                console.log(`Mod ${mod} package.json requires ${check} property`);
                issue = true;
            }
        }

        if ("main" in config)
        {
            if (config.main.split(".").pop() !== "js")
            {
                console.log(`Mod ${mod} package.json main property must be a .js file`);
                issue = true;
            }


            if (!VFS.exists(`${ModController.getModPath(mod)}/${config.main}`))
            {
                console.log(`Mod ${mod} package.json main property points to non-existing file`);
                issue = true;
            }
        }

        return !issue;
    }

    static getLoadOrderRecursive(mod, result, visited)
    {
        // validate package
        if (mod in result)
        {
            return;
        }

        if (mod in visited)
        {
            // front: white, back: red
            Logger.error("Cyclic dependency detected");

            // additional info
            Logger.log(`checking: ${mod}`);
            Logger.log("checked:");
            Logger.log(result);
            Logger.log("visited:");
            Logger.log(visited);

            // wait for input
            process.exit(1);
        }

        // check dependencies
        const config = ModController.imported[mod];
        const dependencies = ("dependencies" in config) ? config.dependencies : [];

        visited[mod] = config.version;

        for (const dependency in dependencies)
        {
            ModController.getLoadOrderRecursive(dependency, result, visited);
        }

        delete visited[mod];

        // fully checked package
        result[mod] = config.version;
    }

    static getLoadOrder(mods)
    {
        let result = {};
        let visited = {};

        for (const mod in mods)
        {
            if (mods[mod] in result)
            {
                continue;
            }

            ModController.getLoadOrderRecursive(mod, result, visited);
        }

        return result;
    }
}

module.exports = ModController;
