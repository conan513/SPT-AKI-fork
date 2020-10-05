/* save.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

class Server
{
    constructor()
    {
        this.profiles = {};
        this.onLoadCallback = {};
        this.oncallbacks = {};
    }

    createVPath()
    {
        const filepath = "user/profiles/";

        if (!fs.existsSync(filepath))
        {
            utility.createDir(filepath);
        }

        if (!("user" in db))
        {
            db.user = {};
        }

        const files = utility.getFileList(filepath);
        let result = [];

        for (let file of files)
        {
            file = file.split(".").slice(0, -1).join(".");
            result[file] = `${filepath}${file}.json`;
        }

        db.user.profiles = result;
    }

    onLoad()
    {
        // genrate virual paths
        this.createVPath();

        // load profiles
        for (const file in db.user.profiles)
        {
            this.onLoadProfile(file);
        }
    }

    onSave()
    {
        // load profiles
        for (const sessionID in this.profiles)
        {
            this.onSaveProfile(sessionID);
        }
    }

    onLoadProfile(sessionID)
    {
        if (sessionID in db.user.profiles)
        {
            // load profile
            this.profiles[sessionID] = json.parse(json.read(db.user.profiles[sessionID]));
        }

        // run callbacks
        for (const callback in this.onLoadCallback)
        {
            this.profiles[sessionID] = this.onLoadCallback[callback](sessionID);
        }
    }

    onSaveProfile(sessionID)
    {
        // run callbacks
        for (const callback in this.oncallbacks)
        {
            this.profiles[sessionID] = this.oncallbacks[callback](sessionID);
        }

        // save profile
        json.write(`user/profiles/${sessionID}.json`, this.profiles[sessionID]);
    }
}

class Controller
{
    initialize()
    {
        if (save_f.config.saveOnExit)
        {
            process.on("exit", (code) =>
            {
                this.onSave();
            });

            process.on("SIGINT", (code) =>
            {
                // linux ctrl-c
                this.onSave();
                process.exit(1);
            });
        }

        if (save_f.config.saveIntervalSec > 0)
        {
            setInterval(() =>
            {
                this.onSave();
            }, save_f.config.saveIntervalSec * 1000);
        }
    }

    onSave()
    {
        save_f.server.onSave();
        logger.logSuccess("Saved profiles");
    }
}

class Callbacks
{
    constructor()
    {
        server.addStartCallback("loadSavehandler", this.load.bind());
        server.addReceiveCallback("SAVE", this.save.bind());
    }

    load()
    {
        save_f.server.onLoad();
        save_f.controller.initialize();
    }

    save(sessionID, req, resp, body, output)
    {
        if (save_f.config.saveOnReceive)
        {
            save_f.controller.onSave();
        }
    }
}

class Config
{
    constructor()
    {
        this.saveOnReceive = false;
        this.saveOnExit = true;
        this.saveIntervalSec = 3;
    }
}

module.exports.server = new Server();
module.exports.controller = new Controller();
module.exports.callbackss = new Callbacks();
module.exports.config = new Config();
