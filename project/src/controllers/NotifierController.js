"use strict";

require("../Lib.js");

class NotifierController
{
    /**
     * The default notification sent when waiting times out.
     */
    static defaultMessage = {
        "type": "ping",
        "eventId": "ping"
    };

    /** Creates a new notification with the specified dialogueMessage object (default type is "new_message"). */
    static createNewMessageNotification(dialogueMessage, extraData = {})
    {
        return {
            "type": (dialogueMessage.type === 4) ? "RagfairOfferSold" : "new_message",
            "eventId": dialogueMessage._id,
            "data" : {
                "dialogId": dialogueMessage.uid,
                "message": dialogueMessage,
                ...extraData
            }
        };
    }

    static getServer(sessionID)
    {
        return `${HttpServer.getBackendUrl()}/notifierServer/get/${sessionID}`;
    }

    static getWebSocketServer(sessionID)
    {
        return `${HttpServer.getWebsocketUrl()}/notifierServer/getwebsocket/${sessionID}`;
    }

    static getChannel(sessionID)
    {
        return {
            "server": HttpConfig.ip,
            "channel_id": sessionID,
            "url": this.getServer(sessionID),
            "notifierServer": this.getServer(sessionID),
            "ws": this.getWebSocketServer(sessionID)
        };
    }
}

module.exports = NotifierController;
