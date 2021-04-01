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

const HttpResponse = require("../utils/HttpResponse");
const NotifierController = require("../controllers/NotifierController.js");

class NotifierCallbacks
{
    static createNotifierChannel(url, info, sessionID)
    {
        return HttpResponse.getBody(NotifierController.getChannel(sessionID));
    }

    static selectProfile(url, info, sessionID)
    {
        return HttpResponse.getBody({
            "status": "ok",
            "notifier": NotifierController.getChannel(sessionID),
            "notifierServer": NotifierController.getServer(sessionID)
        });
    }
}

module.exports = NotifierCallbacks;
