"use strict";

require("../Lib.js");

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
