"use strict";

const fs = require("fs");

let mods = [];

function getModFilepath(mod)
{
    return "user/mods/" + mod.author + "-" + mod.name + "-" + mod.version + "/";
}

function scanRecursiveMod(filepath, baseNode, modNode)
{
    if (typeof modNode === "string")
    {
        baseNode = filepath + modNode;
    }

    if (typeof modNode === "object")
    {
        for (let node in modNode)
        {
            if (!(node in baseNode))
            {
                baseNode[node] = {};
            }

            baseNode[node] = scanRecursiveMod(filepath, baseNode[node], modNode[node]);
        }
    }

    return baseNode;
}

function loadMod(mod, filepath)
{
    logger.logInfo("Loading mod " + mod.author + "-" + mod.name + "-" + mod.version);

    if ("db" in mod)
    {
        db = scanRecursiveMod(filepath, db, mod.db);
    }

    if ("res" in mod)
    {
        res = scanRecursiveMod(filepath, res, mod.res);
    }

    if ("src" in mod)
    {
        src = scanRecursiveMod(filepath, src, mod.src);
    }
}

function detectAllMods()
{
    let dir = "user/mods/";

    if (!fs.existsSync(dir))
    {
        return;
    }

    for (let mod of utility.getDirList(dir))
    {
        /* check if config exists */
        if (!fs.existsSync(dir + mod + "/mod.config.json"))
        {
            logger.logError("Mod " + mod + " is missing mod.config.json");
            logger.logError("Forcing server shutdown...");
            process.exit(1);
        }

        let config = json.parse(json.read(dir + mod + "/mod.config.json"));
        let found = false;

        /* check for duplicate mod */
        for (let installed of mods)
        {
            if (installed.name === config.name)
            {
                logger.logInfo("You have 2 different version of " + mod + " installed");
                logger.logError("Forcing server shutdown...");
                process.exit(1);
            }
        }

        /* add mod to the list */
        if (!found)
        {
            logger.logWarning("Mod " + mod + " not installed, adding it to the modlist");
            mods.push({"name": config.name, "author": config.author, "version": config.version});
        }
    }
}

function loadAllMods()
{
    for (let element of mods)
    {
        let filepath = getModFilepath(element);
        let mod = json.parse(json.read(filepath + "mod.config.json"));
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
        baseNode[node] = scanRecursiveRoute(filepath + node + "/");
    }

    return baseNode;
}

function routeAll()
{
    db = scanRecursiveRoute("db/");
    res = scanRecursiveRoute("res/");
    src = json.parse(json.read("src/loadorder.json"));

    /* add important server paths */
    db.user = {
        "configs": {
            "server": "user/config/server.json"
        },
        "events": {
            "schedule": "user/events/schedule.json"
        }
    };
}

function all()
{
    /* create mods folder if missing */
    if (!fs.existsSync("user/mods/"))
    {
        fs.mkdirSync("user/mods/");
    }

    routeAll();
    detectAllMods()
    loadAllMods();
}

module.exports.all = all;