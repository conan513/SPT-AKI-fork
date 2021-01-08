/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - Terkoiz
 */

"use strict";

/**
 * EFT-Notifier-Controller
 *
 * Maintains a queue of notification messages which will be pushed upon request
 *  from client session.
 */
class Controller
{
    constructor()
    {
        /**
         * The default notification sent when waiting times out.
         */
        this.defaultMessage = {
            type: "ping",
            eventId: "ping"
        };
    }

    /** Creates a new notification with the specified dialogueMessage object (default type is "new_message"). */
    createNewMessageNotification(dialogueMessage, extraData = {})
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

    getServer(sessionID)
    {
        return `${https_f.config.backendUrl}/notifierServer/get/${sessionID}`;
    }

    getWebSocketServer(sessionID)
    {
        return `${https_f.config.websocketUrl}/notifierServer/getwebsocket/${sessionID}`;
    }

    getChannel(sessionID)
    {
        return {
            "server": https_f.config.ip,
            "channel_id": sessionID,
            "url": this.getServer(sessionID),
            "notifierServer": this.getServer(sessionID),
            "ws": this.getWebSocketServer(sessionID)
        };
    }
}

module.exports.Controller = Controller;
