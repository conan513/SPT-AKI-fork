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
            this.profiles[sessionID] = json_f.instance.parse(json_f.instance.read(db.user.profiles[sessionID]));
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
        json_f.instance.write(`user/profiles/${sessionID}.json`, this.profiles[sessionID]);
    }
}

module.exports.Server = Server;
