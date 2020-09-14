"use strict";

class SaveServer
{
    constructor()
    {
        this.users = {};

        this.accounts = {};
        this.profiles = {};
        this.dialogues = {};
        this.healths = {};
        this.effects = {};
        this.insured = {};
    }

    initialize()
    {
        this.accounts = json.parse(json.read(db.user.configs.accounts));

        const files = utility.getDirList("user/profiles/");

        for (let file of files)
        {
            this.users[file] = {
                "info": {},
                "profiles": {
                    "pmc": {},
                    "scav": {}
                },
                "dialogs": {},
                "suits": {},
                "weaponpresets": {},
                "insurance": {},
                "inraid": {
                    "location": "none"
                },
                "vitality": {
                    "health": {},
                    "effects": {}
                }
            }
        }

        logger.logData(this.users);
    }

    initializeDialogue(sessionID)
    {
        this.dialogues[sessionID] = json.parse(json.read(this.getDialoguePath(sessionID)));
    }

    initializeProfile(sessionID)
    {
        this.profiles[sessionID] = {};
        this.loadProfilesFromDisk(sessionID);
    }

    /* resets the healh response */
    initializeHealth(sessionID)
    {
        this.healths[sessionID] = {
            "Hydration": 0,
            "Energy": 0,
            "Head": 0,
            "Chest": 0,
            "Stomach": 0,
            "LeftArm": 0,
            "RightArm": 0,
            "LeftLeg": 0,
            "RightLeg": 0
        };
        this.effects[sessionID] = {
            "Head": {},
            "Chest": {},
            "Stomach": {},
            "LeftArm": {},
            "RightArm": {},
            "LeftLeg": {},
            "RightLeg": {}
        };

        return this.healths[sessionID];
    }

    /* resets items to send on flush */
    initializeInsurance(sessionID)
    {
        this.insured[sessionID] = {};
    }

    loadProfilesFromDisk(sessionID)
    {
        this.profiles[sessionID]["pmc"] = json.parse(json.read(this.getProfilePath(sessionID)));
        profile_f.profileController.generateScav(sessionID);
    }

    getAccountPath(sessionID)
    {
        return "user/profiles/" + sessionID + "/";
    }

    getProfilePath(sessionID)
    {
        let pmcPath = db.user.profiles.character;
        return pmcPath.replace("__REPLACEME__", sessionID);
    }

    getDialoguePath(sessionID)
    {
        let path = db.user.profiles.dialogue;
        return path.replace("__REPLACEME__", sessionID);
    }

    getSuitsPath(sessionID)
    {
        let path = db.user.profiles.suits;
        return path.replace("__REPLACEME__", sessionID);
    }

    getWeaponBuildPath(sessionID)
    {
        let path = db.user.profiles.weaponbuilds;
        return path.replace("__REPLACEME__", sessionID);
    }

    getOpenSessions()
    {
        return Object.keys(this.profiles);
    }

    getProfile(sessionID, type)
    {
        if (!(sessionID in this.profiles))
        {
            this.initializeProfile(sessionID);
            this.initializeDialogue(sessionID);
            this.initializeHealth(sessionID);
            this.initializeInsurance(sessionID);
        }

        return this.profiles[sessionID][type];
    }

    saveToDisk()
    {
        // accounts
        json.write(db.user.configs.accounts, this.accounts);

        for (let sessionID of this.getOpenSessions())
        {
            // dialogues
            if (sessionID in this.dialogues)
            {
                json.write(this.getDialoguePath(sessionID), this.dialogues[sessionID]);
            }

            // profile
            if ("pmc" in this.profiles[sessionID])
            {
                json.write(this.getProfilePath(sessionID), this.profiles[sessionID]["pmc"]);
            }
        }
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
                this.saveOpenSessions();
            });

            process.on("SIGINT", (code) =>
            {
                this.saveOpenSessions();
                logger.logInfo("Ctrl-C, exiting ...");
                process.exit(1);
            });
        }

        if (save_f.saveConfig.saveIntervalSec > 0)
        {
            setInterval(function()
            {
                this.saveOpenSessions();
                logger.logSuccess("Player progress autosaved!");
            }, save_f.saveConfig.saveIntervalSec * 1000);
        }
    }

    saveOpenSessions()
    {
        save_f.saveServer.saveToDisk();
        events.scheduledEventHandler.saveToDisk();
    }
}

class SaveCallback
{
    constructor()
    {
        server.addStartCallback("loadSavehandler", this.load.bind());
        server.addReceiveCallback("SAVE", this.saveCallback.bind());
    }

    load()
    {
        save_f.saveServer.initialize();
        save_f.saveController.initialize();
    }

    saveCallback(sessionID, req, resp, body, output)
    {
        if (save_f.saveConfig.saveOnReceive)
        {
            save_f.saveController.saveOpenSessions();
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
