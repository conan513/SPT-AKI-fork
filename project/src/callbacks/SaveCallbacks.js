/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const SaveServer = require("../servers/SaveServer.js");

class SaveCallbacks
{
    static load()
    {
        SaveServer.load();
    }

    static update(timeSinceLastRun)
    {
        // run every 15 seconds
        if (timeSinceLastRun > 15 * 1)
        {
            SaveServer.save();
            Logger.debug("Saved profiles");
            return true;
        }

        return false;
    }
}

module.exports = SaveCallbacks;
