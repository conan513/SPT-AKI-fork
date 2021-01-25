/* loader.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class ModController
{
    constructor()
    {
        this.basepath = "user/mods/";
        this.imported = {};
        this.bundles = {};
        this.onLoad = {};
    }

    load()
    {
        this.importMods();
        this.executeMods();
    }

    importClass(name, filepath)
    {
        // import class
        global[name] = require(`../../${filepath}`);
    }

    importMods()
    {
        // get mods
        if (!vfs.exists(this.basepath))
        {
            // no mods folder found
            vfs.createDir(this.basepath);
            return;
        }

        Logger.log("ModLoader: loading mods...");
        const mods = vfs.getDirs(this.basepath);

        // validate mods
        for (const mod of mods)
        {
            if (!this.validMod(mod))
            {
                Logger.error("Invalid mod encountered");
                return;
            }
        }

        // add mods
        for (const mod of mods)
        {
            this.addMod(mod);
        }
    }

    executeMods()
    {
        // sort mods load order
        const source = Object.keys(this.getLoadOrder(this.imported));

        // import mod classes
        for (const mod of source)
        {
            if ("main" in this.imported[mod])
            {
                this.importClass(mod, `${this.getModPath(mod)}${this.imported[mod].main}`);
            }
        }

        // load mods
        for (const mod in this.onLoad)
        {
            this.onLoad[mod]();
        }
    }

    getModPath(mod)
    {
        return `${this.basepath}${mod}/`;
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
        const bundle = JsonUtil.clone(this.bundles[key]);

        if (local)
        {
            bundle.path = bundle.filepath;
        }

        delete bundle.filepath;
        return bundle;
    }

    addBundles(modpath)
    {
        const manifest = JsonUtil.deserialize(vfs.readFile(`${modpath}bundles.json`)).manifest;

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

            this.bundles[bundleInfo.key] = bundle;
        }
    }

    addMod(mod)
    {
        const modpath = this.getModPath(mod);

        // add mod to imported list
        this.imported[mod] = JsonUtil.deserialize(vfs.readFile(`${modpath}/package.json`));

        // add mod bundles
        if (vfs.exists(`${modpath}bundles.json`))
        {
            this.addBundles(modpath);
        }
    }

    validMod(mod)
    {
        // check if config exists
        if (!vfs.exists(`${this.getModPath(mod)}/package.json`))
        {
            console.log(`Mod ${mod} is missing package.json`);
            return false;
        }

        // validate mod
        const config = JsonUtil.deserialize(vfs.readFile(`${this.getModPath(mod)}/package.json`));
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


            if (!vfs.exists(`${this.getModPath(mod)}/${config.main}`))
            {
                console.log(`Mod ${mod} package.json main property points to non-existing file`);
                issue = true;
            }
        }

        return !issue;
    }

    getLoadOrderRecursive(mod, result, visited)
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
        const config = this.imported[mod];
        const dependencies = ("dependencies" in config) ? config.dependencies : [];

        visited[mod] = config.version;

        for (const dependency in dependencies)
        {
            this.getLoadOrderRecursive(dependency, result, visited);
        }

        delete visited[mod];

        // fully checked package
        result[mod] = config.version;
    }

    getLoadOrder(mods)
    {
        let result = {};
        let visited = {};

        for (const mod in mods)
        {
            if (mods[mod] in result)
            {
                continue;
            }

            this.getLoadOrderRecursive(mod, result, visited);
        }

        return result;
    }
}

module.exports = new ModController();
