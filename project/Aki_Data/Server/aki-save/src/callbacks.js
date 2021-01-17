/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class SaveCallbacks
{
    constructor()
    {
        core_f.packager.onLoad["loadSavehandler"] = this.load.bind(this);
        https_f.server.onReceive["SAVE"] = this.save.bind(this);
    }

    load()
    {
        save_f.server.load();
    }

    save(sessionID, req, resp, body, output)
    {
        save_f.server.save();
    }
}

module.exports.SaveCallbacks = SaveCallbacks;
