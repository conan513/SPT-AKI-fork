/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san
 */

"use strict";

const JsonUtil = require("../utils/JsonUtil");
const VFS = require("../utils/VFS");

class SaveServer
{
    static filepath = "user/profiles/";
    static profiles = {};
    static onLoad = require("../bindings/SaveLoad");
    static onSave = {};

    static load()
    {
        // get files to load
        if (!VFS.exists(SaveServer.filepath))
        {
            VFS.createDir(SaveServer.filepath);
        }

        const files = VFS.getFiles(SaveServer.filepath).filter((item) =>
        {
            return VFS.getFileExtension(item) === "json";
        });

        // load profiles
        for (let file of files)
        {
            SaveServer.loadProfile(VFS.stripExtension(file));
        }
    }

    static save()
    {
        // load profiles
        for (const sessionID in SaveServer.profiles)
        {
            SaveServer.saveProfile(sessionID);
        }
    }

    static loadProfile(sessionID)
    {
        const file = `${SaveServer.filepath}${sessionID}.json`;

        if (VFS.exists(file))
        {
            // load profile
            SaveServer.profiles[sessionID] = JsonUtil.deserialize(VFS.readFile(file));
        }

        // run callbacks
        for (const callback in SaveServer.onLoad)
        {
            SaveServer.profiles[sessionID] = SaveServer.onLoad[callback](sessionID);
        }
    }

    static saveProfile(sessionID)
    {
        const file = `${SaveServer.filepath}${sessionID}.json`;

        // run callbacks
        for (const callback in SaveServer.onSave)
        {
            SaveServer.profiles[sessionID] = SaveServer.onSave[callback](sessionID);
        }

        // save profile
        VFS.writeFile(file, JsonUtil.serialize(SaveServer.profiles[sessionID], true));
    }
}

module.exports = SaveServer;
