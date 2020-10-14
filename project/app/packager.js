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
        this.filepath = "mods/";
        this.mods = [];
        this.onLoad = {};
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

    loadMod(mod)
    {
        const config = JSON.parse(fs.readFileSync(`${this.filepath}${mod}/package.json`));
        this.mods[mod] = config;
        this.src[mod] = `mods/${mod}/${config.main}`;
    }

    validateMod(mod)
    {
        // check if config exists
        if (!fs.existsSync(`${this.filepath}${mod}/package.json`))
        {
            console.log(`Mod ${mod} is missing package.json`);
            this.exitApp();
        }

        // validate mod
        const config = JSON.parse(fs.readFileSync(`${this.filepath}${mod}/package.json`));
        const checks = ["name", "author", "version", "license", "main"];
        let issue = false;

        for (const check of checks)
        {
            if (!(check in config))
            {
                console.log(`Mod ${mod} package.json requires ${check} propery`);
                issue = true;
            }
        }

        if (!fs.existsSync(`${this.filepath}${mod}/${config.main}`))
        {
            console.log(`Mod ${mod} package.json main points to non-existing file`);
            issue = true;
        }

        if (config.main.split(".").pop() !== "js")
        {
            console.log(`Mod ${mod} package.json main must be a .js file`);
            issue = true;
        }

        // issues found
        if (issue)
        {
            this.exitApp();
        }
    }

    loadMods()
    {
        if (!fs.existsSync(this.filepath))
        {
            return;
        }

        const mods = fs.readdirSync(this.filepath).filter((file) =>
        {
            return fs.statSync(`${this.filepath}/${file}`).isDirectory();
        });

        for (const mod of mods)
        {
            this.validateMod(mod);
            this.loadMod(mod);
        }
    }

    // load classes
    loadCode()
    {
        for (let name in this.src)
        {
            global[name] = require(`../${this.src[name]}`);
        }
    }

    loadClasses()
    {
        // execute start callback
        common_f.logger.logWarning("Server: executing startup callbacks...");

        for (const callback in this.onLoad)
        {
            this.onLoad[callback]();
        }
    }

    load()
    {
        // create mods folder if missing
        if (!fs.existsSync(this.filepath))
        {
            fs.mkdirSync(this.filepath);
        }

        this.src = JSON.parse(fs.readFileSync("packages/loadorder.json"));

        this.loadMods();
        this.loadCode();
        this.loadClasses();
    }
}

module.exports.packager = new Packager();
