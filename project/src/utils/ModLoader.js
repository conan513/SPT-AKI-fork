"use strict";

require("../Lib.js");

class ModLoader
{
    static basepath = "";
    static imported = {};
    static bundles = {};
    static onLoad = {};

    static load()
    {
        ModLoader.basepath = "user/mods/";
        ModLoader.importMods();
        ModLoader.executeMods();
    }

    static importClass(name, filepath)
    {
        // import class
        const modpath = (globalThis.G_RELEASE_CONFIGURATION) ? `../${filepath}` : `../../${filepath}`;
        globalThis[name] = require(modpath);
    }

    static importMods()
    {
        // get mods
        if (!VFS.exists(ModLoader.basepath))
        {
            // no mods folder found
            VFS.createDir(ModLoader.basepath);
            return;
        }

        Logger.log("ModLoader: loading mods...");
        const mods = VFS.getDirs(ModLoader.basepath);

        // validate mods
        for (const mod of mods)
        {
            if (!ModLoader.validMod(mod))
            {
                Logger.error("Invalid mod encountered");
                return;
            }
        }

        // add mods
        for (const mod of mods)
        {
            ModLoader.addMod(mod);
        }
    }

    static executeMods()
    {
        // sort mods load order
        const source = Object.keys(ModLoader.getLoadOrder(ModLoader.imported));

        // import mod classes
        for (const mod of source)
        {
            if ("main" in ModLoader.imported[mod])
            {
                ModLoader.importClass(mod, `${ModLoader.getModPath(mod)}${ModLoader.imported[mod].main}`);
            }
        }

        // load mods
        for (const mod in ModLoader.onLoad)
        {
            ModLoader.onLoad[mod]();
        }
    }

    static getModPath(mod)
    {
        return `${ModLoader.basepath}${mod}/`;
    }

    static getBundles(local)
    {
        const result = [];

        for (const bundle in ModLoader.bundles)
        {
            result.push(ModLoader.getBundle(bundle, local));
        }

        return result;
    }

    static getBundle(key, local)
    {
        const bundle = JsonUtil.clone(ModLoader.bundles[key]);

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
                "path": `${HttpServer.getBackendUrl()}/files/bundle/${bundleInfo.key}`,
                "filepath" : ("path" in bundleInfo)
                    ? bundleInfo.path
                    : `${process.cwd()}/${modpath}bundles/${bundleInfo.key}`.replace(/\\/g, "/"),
                "dependencyKeys": ("dependencyKeys" in bundleInfo) ? bundleInfo.dependencyKeys : []
            };

            ModLoader.bundles[bundleInfo.key] = bundle;
        }
    }

    static addMod(mod)
    {
        const modpath = ModLoader.getModPath(mod);

        // add mod to imported list
        ModLoader.imported[mod] = JsonUtil.deserialize(VFS.readFile(`${modpath}/package.json`));

        // add mod bundles
        if (VFS.exists(`${modpath}bundles.json`))
        {
            ModLoader.addBundles(modpath);
        }
    }

    static validMod(mod)
    {
        // check if config exists
        if (!VFS.exists(`${ModLoader.getModPath(mod)}/package.json`))
        {
            console.log(`Mod ${mod} is missing package.json`);
            return false;
        }

        // validate mod
        const config = JsonUtil.deserialize(VFS.readFile(`${ModLoader.getModPath(mod)}/package.json`));
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


            if (!VFS.exists(`${ModLoader.getModPath(mod)}/${config.main}`))
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
        const config = ModLoader.imported[mod];

        if (typeof config === "undefined")
        {
            Logger.error(`Missing required mod dependency: ${mod}`);
            throw "Error parsing mod load order";
        }

        const dependencies = ("dependencies" in config) ? config.dependencies : [];

        visited[mod] = config.version;

        for (const dependency in dependencies)
        {
            ModLoader.getLoadOrderRecursive(dependency, result, visited);
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

            ModLoader.getLoadOrderRecursive(mod, result, visited);
        }

        return result;
    }
}

module.exports = ModLoader;
