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
    static load()
    {
        save_f.server.load();
    }

    static update(timeSinceLastRun)
    {
        // run every 15 seconds
        if (timeSinceLastRun > 15 * 1)
        {
            save_f.server.save();
            Logger.debug("Saved profiles");
            return true;
        }

        return false;
    }
}

module.exports = SaveCallbacks;
