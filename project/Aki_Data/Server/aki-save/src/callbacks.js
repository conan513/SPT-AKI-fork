/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        core_f.packager.onLoad["loadSavehandler"] = this.load.bind(this);
        https_f.server.onReceive["SAVE"] = this.save.bind(this);
    }

    load()
    {
        save_f.server.load();
        save_f.controller.load();
    }

    save(sessionID, req, resp, body, output)
    {
        if (save_f.config.saveOnReceive)
        {
            save_f.controller.onSave();
        }
    }
}

module.exports.Callbacks = Callbacks;
