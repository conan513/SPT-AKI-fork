/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san
 */

"use strict";

class Server
{
    constructor()
    {
        this.profiles = {};
        this.onLoadCallback = {};
        this.onSaveCallbacks = {};
    }

    onLoad()
    {
        // get files to load
        if (!common_f.vfs.exists(save_f.config.filepath))
        {
            common_f.vfs.createDir(save_f.config.filepath);
        }

        const files = common_f.vfs.getFiles(save_f.config.filepath);

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
        const file = `${save_f.config.filepath}${sessionID}.json`;

        if (common_f.vfs.exists(file))
        {
            // load profile
            this.profiles[sessionID] = common_f.json.deserialize(common_f.vfs.readFile(file));
        }

        // run callbacks
        for (const callback in this.onLoadCallback)
        {
            this.profiles[sessionID] = this.onLoadCallback[callback](sessionID);
        }
    }

    onSaveProfile(sessionID)
    {
        const file = `${save_f.config.filepath}${sessionID}.json`;

        // run callbacks
        for (const callback in this.onSaveCallbacks)
        {
            this.profiles[sessionID] = this.onSaveCallbacks[callback](sessionID);
        }

        // save profile
        common_f.vfs.writeFile(file, common_f.json.serialize(this.profiles[sessionID], true));
    }
}

module.exports.Server = Server;
