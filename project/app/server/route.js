/* route.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

let mods = [];

function getModFilepath(mod)
{
    return `mods/${mod.author}-${mod.name}/`;
}

function loadMod(mod, filepath)
{
    logger.logInfo(`Loading mod ${mod.author}-${mod.name}`);

    if ("db" in mod)
    {
        db = scanRecursiveRoute(`${filepath}/db/`);
    }

    if ("res" in mod)
    {
        res = scanRecursiveRoute(`${filepath}/res/`);
    }

    if ("src" in mod)
    {
        for (const source in mod.src)
        {
            src[source] = mod.src[source];
        }
    }
}

function detectAllMods()
{
    let dir = "mods/";

    if (!fs.existsSync(dir))
    {
        return;
    }

    for (let mod of utility.getDirList(dir))
    {
        /* check if config exists */
        if (!fs.existsSync(`${dir}${mod}/mod.config.json`))
        {
            logger.logError(`Mod ${mod} is missing mod.config.json`);
            logger.logError("Forcing server shutdown...");
            process.exit(1);
        }

        let config = json.parse(json.read(`${dir}${mod}/mod.config.json`));

        /* check legacy mod */
        if (!("experimental" in config) || !config.experimental)
        {
            logger.logError("Legacy mod detected");
            logger.logError("Forcing server shutdown...");
            process.exit(1);
        }

        /* add mod to the list */
        logger.logWarning(`Mod ${mod} not installed, adding it to the modlist`);
        mods.push({"name": config.name, "author": config.author});
    }
}

function loadAllMods()
{
    for (let element of mods)
    {
        let filepath = getModFilepath(element);
        let mod = json.parse(json.read(`${filepath}mod.config.json`));
        loadMod(mod, filepath);
    }
}

function scanRecursiveRoute(filepath)
{
    let baseNode = {};
    let directories = utility.getDirList(filepath);
    let files = fs.readdirSync(filepath);

    // remove all directories from files
    for (let directory of directories)
    {
        for (let file in files)
        {
            if (files[file] === directory)
            {
                files.splice(file, 1);
            }
        }
    }

    // make sure to remove the file extention
    for (let node in files)
    {
        let fileName = files[node].split(".").slice(0, -1).join(".");
        baseNode[fileName] = filepath + files[node];
    }

    // deep tree search
    for (let node of directories)
    {
        baseNode[node] = scanRecursiveRoute(`${filepath}${node}/`);
    }

    return baseNode;
}

function routeAll()
{
    db = scanRecursiveRoute("db/");
    res = scanRecursiveRoute("res/");
    src = json.parse(json.read("src/loadorder.json"));
}

function all()
{
    /* create mods folder if missing */
    if (!fs.existsSync("mods/"))
    {
        fs.mkdirSync("mods/");
    }

    routeAll();
    detectAllMods();
    loadAllMods();
}

module.exports.all = all;