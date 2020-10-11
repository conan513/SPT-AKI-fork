/* generator.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Terkoiz
 */

"use strict";

const fs = require("fs");

class Server
{
    constructor()
    {
        this.profiles = {};
        this.onLoadCallback = {};
        this.onSaveCallbacks = {};
    }

    getFiles()
    {
        if (!fs.existsSync(save_f.config.filepath))
        {
            utility.createDir(save_f.config.filepath);
        }

        return utility.getFileList(save_f.config.filepath);
    }

    onLoad()
    {
        // genrate virual paths
        const files = this.getFiles();

        // load profiles
        for (let file of files)
        {
            file = file.split(".").slice(0, -1).join(".");
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
        if (fs.existsSync(`${save_f.config.filepath}${sessionID}.json`))
        {
            // load profile
            this.profiles[sessionID] = json_f.instance.parse(json_f.instance.read(`${save_f.config.filepath}${sessionID}.json`));
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
        for (const callback in this.onSaveCallbacks)
        {
            this.profiles[sessionID] = this.onSaveCallbacks[callback](sessionID);
        }

        // save profile
        json_f.instance.write(`${save_f.config.filepath}${sessionID}.json`, this.profiles[sessionID]);
    }
}

module.exports.Server = Server;
