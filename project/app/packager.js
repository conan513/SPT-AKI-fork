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
        this.modpath = "mods/";
        this.mods = [];
        this.onLoad = {};
    }

    loadMod(mod)
    {
        const config = JSON.parse(fs.readFileSync(`${this.modpath}${mod}/package.json`));
        this.mods[mod] = config;
        this.src[mod] = `${this.modpath}${mod}/${config.main}`;
    }

    validMod(mod)
    {
        // check if config exists
        if (!fs.existsSync(`${this.modpath}${mod}/package.json`))
        {
            console.log(`Mod ${mod} is missing package.json`);
            return false;
        }

        // validate mod
        const config = JSON.parse(fs.readFileSync(`${this.modpath}${mod}/package.json`));
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

        if (!fs.existsSync(`${this.modpath}${mod}/${config.main}`))
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
            return false;
        }

        return true;
    }

    prepareLoad()
    {
        if (!fs.existsSync(this.modpath))
        {
            // no mods folder found
            fs.mkdirSync(this.modpath); 
            return true;
        }

        // get mods
        const mods = fs.readdirSync(this.modpath).filter((file) =>
        {
            return fs.statSync(`${this.modpath}/${file}`).isDirectory();
        });

        // add mods to load
        for (const mod of mods)
        {
            if (!this.validMod(mod))
            {
                return false;
            }
            
            this.loadMod(mod);
        }

        return true;
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
        this.src = JSON.parse(fs.readFileSync("packages/loadorder.json"));

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
