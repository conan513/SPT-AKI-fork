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
        this.packages = [];
    }

    getModFilepath(mod)
    {
        return `${this.baseDir}/${mod.author}-${mod.name}/`;
    }

    loadMod(mod, filepath)
    {
        logger_f.instance.logInfo(`Loading mod ${mod.author}-${mod.name}`);

        if ("db" in mod)
        {
            db = this.scanRecursiveRoute(`${filepath}/db/`);
        }

        if ("res" in mod)
        {
            res = this.scanRecursiveRoute(`${filepath}/res/`);
        }

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

        for (const mod of utility.getDirList(this.baseDir))
        {
            // check if config exists
            if (!fs.existsSync(`${this.baseDir}${mod}/package.json`))
            {
                logger_f.instance.logError(`Mod ${mod} is missing package.json`);
                logger_f.instance.logError("Forcing server shutdown...");
                process.exit(1);
            }

            const config = JSON.parse(fs.readFileSync(`${this.baseDir}${mod}/package.json`));

            // check legacy mod
            if (!("experimental" in config) || !config.experimental)
            {
                logger_f.instance.logError("Legacy mod detected");
                logger_f.instance.logError("Forcing server shutdown...");
                process.exit(1);
            }

            // add mod to the list
            logger_f.instance.logWarning(`Mod ${mod} not installed, adding it to the modlist`);
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

    scanRecursiveRoute(filepath)
    {
        const directories = utility.getDirList(filepath);
        const files = fs.readdirSync(filepath);
        let baseNode = {};

        // remove all directories from files
        for (const directory of directories)
        {
            for (const file in files)
            {
                if (files[file] === directory)
                {
                    files.splice(file, 1);
                }
            }
        }

        // make sure to remove the file extention
        for (const node in files)
        {
            const fileName = files[node].split(".").slice(0, -1).join(".");
            baseNode[fileName] = filepath + files[node];
        }

        // deep tree search
        for (const node of directories)
        {
            baseNode[node] = this.scanRecursiveRoute(`${filepath}${node}/`);
        }

        return baseNode;
    }

    routeAll()
    {
        db = this.scanRecursiveRoute("db/");
        res = this.scanRecursiveRoute("res/");
        src = JSON.parse(fs.readFileSync("src/loadorder.json"));
    }

    // load classes
    initializeClasses()
    {
        for (let name in src)
        {
            global[name] = require(`../${src[name]}`);
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
        this.detectAllMods();
        this.loadAllMods();
        this.initializeClasses();
    }
}

module.exports.instance = new Packager();
