"use strict";

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
        account_f.accountServer.saveToDisk();
        events.scheduledEventHandler.saveToDisk();
    
        for (let sessionId of profile_f.profileServer.getOpenSessions())
        {
            profile_f.profileServer.saveToDisk(sessionId);
            dialogue_f.dialogueServer.saveToDisk(sessionId);
        }
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

module.exports.saveController = new SaveController();
module.exports.saveCallbacks = new SaveCallback();
module.exports.saveConfig = new SaveConfig();
