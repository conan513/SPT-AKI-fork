/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - Sock
 */

"use strict";

class NotifierCallbacks
{
    static createNotifierChannel(url, info, sessionID)
    {
        return https_f.response.getBody(notifier_f.controller.getChannel(sessionID));
    }

    static selectProfile(url, info, sessionID)
    {
        return https_f.response.getBody({
            "status": "ok",
            "notifier": notifier_f.controller.getChannel(sessionID),
            "notifierServer": notifier_f.controller.getServer(sessionID)
        });
    }
}

module.exports = NotifierCallbacks;
