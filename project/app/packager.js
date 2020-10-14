/* route.js
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
        this.baseDir = "packages/";
        this.onLoad = {};
        this.packages = [];
    }

    getModFilepath(mod)
    {
        return `${this.baseDir}/${mod.author}-${mod.name}/`;
    }

    loadMod(mod, filepath)
    {
        console.log(`Loading mod ${mod.author}-${mod.name}`);

        if ("src" in mod)
        {
            for (const source in mod.src)
            {
                src[source] = mod.src[source];
            }
        }
    }

    detectAllMods()
    {
        if (!fs.existsSync(this.baseDir))
        {
            return;
        }

        const mods = fs.readdirSync(this.baseDir).filter((file) =>
        {
            return fs.statSync(`${this.baseDir}/${file}`).isDirectory();
        });

        for (const mod of mods)
        {
            // check if config exists
            if (!fs.existsSync(`${this.baseDir}${mod}/package.json`))
            {
                console.log(`Mod ${mod} is missing package.json`);
                console.log("Forcing server shutdown...");
                process.exit(1);
            }

            const config = JSON.parse(fs.readFileSync(`${this.baseDir}${mod}/package.json`));

            // check legacy mod
            if (!("experimental" in config) || !config.experimental)
            {
                console.log("Legacy mod detected");
                console.log("Forcing server shutdown...");
                process.exit(1);
            }

            // add mod to the list
            console.log(`Mod ${mod} not installed, adding it to the modlist`);
            this.packages.push({"name": config.name, "author": config.author, "version": config.version});
        }
    }

    loadAllMods()
    {
        for (const element of this.packages)
        {
            const filepath = this.getModFilepath(element);
            const mod = JSON.parse(fs.readFileSync(`${filepath}package.json`));
            this.loadMod(mod, filepath);
        }
    }

    routeAll()
    {
        src = JSON.parse(fs.readFileSync("packages/loadorder.json"));
    }

    // load classes
    initializeClasses()
    {
        for (let name in src)
        {
            global[name] = require(`../${src[name]}`);
        }
    }

    loadClasses()
    {
        // execute start callback
        common_f.logger.logWarning("Server: executing startup callbacks...");

        for (let type in this.onLoad)
        {
            this.onLoad[type]();
        }
    }

    all()
    {
        // create mods folder if missing
        if (!fs.existsSync(this.baseDir))
        {
            fs.mkdirSync(this.baseDir);
        }

        this.routeAll();

        //this.detectAllMods();
        //this.loadAllMods();

        this.initializeClasses();
        this.loadClasses();
    }
}

module.exports.packager = new Packager();
