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
        this.onLoad = {};
        this.onSave = {};
    }

    load()
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
            this.loadProfile(file);
        }
    }

    save()
    {
        // load profiles
        for (const sessionID in this.profiles)
        {
            this.saveProfile(sessionID);
        }
    }

    loadProfile(sessionID)
    {
        const file = `${save_f.config.filepath}${sessionID}.json`;

        if (common_f.vfs.exists(file))
        {
            // load profile
            this.profiles[sessionID] = common_f.json.deserialize(common_f.vfs.readFile(file));
        }

        // run callbacks
        for (const callback in this.onLoad)
        {
            this.profiles[sessionID] = this.onLoad[callback](sessionID);
        }
    }

    saveProfile(sessionID)
    {
        const file = `${save_f.config.filepath}${sessionID}.json`;

        // run callbacks
        for (const callback in this.onSave)
        {
            this.profiles[sessionID] = this.onSave[callback](sessionID);
        }

        // save profile
        common_f.vfs.writeFile(file, common_f.json.serialize(this.profiles[sessionID], true));
    }
}

module.exports.Server = Server;