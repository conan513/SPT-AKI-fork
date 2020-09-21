"use strict";

const fs = require("fs");

class SaveServer
{
    constructor()
    {
        this.profiles = {};
        this.onLoadCallback = {};
        this.onSaveCallback = {};
    }

    createVPath()
    {
        const filepath = "user/profiles/";

        if (!fs.existsSync(filepath))
        {
            utility.createDir(filepath);
        }

        let paths = [];
        let files = utility.getFileList(filepath);

        for (let file of files)
        {
            file = file.split('.').slice(0, -1).join('.');
            paths[file] = `${filepath}${file}.json`;
        }

        db.user.profiles = paths;
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

        // rebuild virual paths
        this.createVPath();
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
        for (const callback in this.onSaveCallback)
        {
            this.profiles[sessionID] = this.onSaveCallback[callback](sessionID);
        }

        // save profile
        json.write(`user/profiles/${sessionID}.json`, this.profiles[sessionID]);
    }
}

class SaveController
{
    initialize()
    {
        if (save_f.saveConfig.saveOnExit)
        {
            process.on("exit", (code) =>
            {
                this.onSave();
            });

            process.on("SIGINT", (code) =>
            {
                this.onSave();
                logger.logInfo("Ctrl-C, exiting ...");
                process.exit(1);
            });
        }

        if (save_f.saveConfig.saveIntervalSec > 0)
        {
            setInterval(function()
            {
                this.onSave();
                logger.logSuccess("Player progress autosaved!");
            }, save_f.saveConfig.saveIntervalSec * 1000);
        }
    }

    onSave()
    {
        save_f.saveServer.onSave();
        events.scheduledEventHandler.saveToDisk();
    }
}

class SaveCallback
{
    constructor()
    {
        server.addStartCallback("loadSavehandler", this.load.bind());
        server.addReceiveCallback("SAVE", this.save.bind());
    }

    load()
    {
        save_f.saveServer.onLoad();
        save_f.saveController.initialize();
    }

    save(sessionID, req, resp, body, output)
    {
        if (save_f.saveConfig.saveOnReceive)
        {
            save_f.saveController.onSave();
        }
    }
}

class SaveConfig
{
    constructor()
    {
        this.saveOnReceive = true;
        this.saveOnExit = false;
        this.saveIntervalSec = 0;
    }
}

module.exports.saveServer = new SaveServer();
module.exports.saveController = new SaveController();
module.exports.saveCallbacks = new SaveCallback();
module.exports.saveConfig = new SaveConfig();
