/* packager.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

class Packager
{
    constructor()
    {
        this.modpath = "mods/";
        this.source = this.addInitialSource();
        this.mods = {};
        this.loadorder = [];
        this.onLoad = {};
    }

    addInitialSource()
    {
        let source = JSON.parse(fs.readFileSync("Aki_Data/Server/loadorder.json"));

        for (const pkg in source)
        {
            source[pkg] = "Aki_Data/Server/" + source[pkg];
        }

        return source;
    }

    getModPath(mod)
    {
        return `${this.modpath}${mod}/`;
    }

    addMod(mod)
    {
        this.mods[mod] = JSON.parse(fs.readFileSync(`${this.getModPath(mod)}/package.json`));
    }

    addSource(mod)
    {
        this.source[mod] = `${this.getModPath(mod)}/${this.mods[mod].main}`;
    }

    validMod(mod)
    {
        // check if config exists
        if (!fs.existsSync(`${this.getModPath(mod)}/package.json`))
        {
            console.log(`Mod ${mod} is missing package.json`);
            return false;
        }

        // validate mod
        const config = JSON.parse(fs.readFileSync(`${this.getModPath(mod)}/package.json`));
        const checks = ["name", "author", "version", "license", "main"];
        let issue = false;

        for (const check of checks)
        {
            if (!(check in config))
            {
                console.log(`Mod ${mod} package.json requires ${check} property`);
                issue = true;
            }
        }

        if (!fs.existsSync(`${this.getModPath(mod)}/${config.main}`))
        {
            console.log(`Mod ${mod} package.json main property points to non-existing file`);
            issue = true;
        }

        if (config.main.split(".").pop() !== "js")
        {
            console.log(`Mod ${mod} package.json main property must be a .js file`);
            issue = true;
        }

        // issues found
        if (issue)
        {
            return false;
        }

        return true;
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
            console.log("\x1b[37m\x1b[41mcyclic dependency detected\x1b[0m");

            // additional info
            console.log(`checking: ${mod}`);
            console.log("checked:");
            console.log(result);
            console.log("visited:");
            console.log(visited);

            // wait for input
            process.exit(1);
        }

        // check dependencies
        const config = this.mods[mod];
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

        for (const mod of mods)
        {
            if (mod in result)
            {
                continue;
            }

            this.getLoadOrderRecursive(mod, result, visited);
        }

        return result;
    }

    prepareLoad()
    {
        if (!fs.existsSync(this.modpath))
        {
            // no mods folder found
            fs.mkdirSync(this.modpath, { "recursive": true });
            return true;
        }

        // get mods
        const mods = fs.readdirSync(this.modpath).filter((mod) =>
        {
            return fs.statSync(`${this.getModPath(mod)}`).isDirectory();
        });

        // validate mods
        for (const mod of mods)
        {
            if (!this.validMod(mod))
            {
                return false;
            }
        }

        // add mods to load
        for (const mod of mods)
        {
            this.addMod(mod);
        }

        // sort mods load order
        const loadorder = Object.keys(this.getLoadOrder(mods));

        // add mods source
        for (const mod of loadorder)
        {
            this.addSource(mod);
        }

        return true;
    }

    // load classes
    loadCode()
    {
        for (const name in this.source)
        {
            global[name] = require(`../${this.source[name]}`);
        }
    }

    loadClasses()
    {
        // execute start callback
        console.log("Server: executing startup callbacks...");

        for (const callback in this.onLoad)
        {
            this.onLoad[callback]();
        }
    }

    exitApp()
    {
        console.log("Press any key to continue");

        process.stdin.setRawMode(true);
        process.stdin.once("data", (data) =>
        {
            process.exit(1);
        });
    }

    load()
    {
        if (this.prepareLoad())
        {
            this.loadCode();
            this.loadClasses();
        }
        else
        {
            this.exitApp();
        }
    }
}

module.exports.packager = new Packager();
