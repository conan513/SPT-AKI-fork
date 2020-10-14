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
        save_f.server.onLoad["events"] = this.onLoad.bind(this);
    }

    onLoad(sessionID)
    {
        return event_f.controller.onLoad(sessionID);
    }
}

module.exports.Callbacks = Callbacks;
