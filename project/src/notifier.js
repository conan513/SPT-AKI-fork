/* notifier.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

/*
* controller class maintains a queue of notifications which will be pushed upon notification
* request from client per session.
*/
class Controller
{
    constructor()
    {
        this.messageQueue = {};
    }

    /* Get messageQueue for a particular sessionID. */
    getMessageQueue(sessionID)
    {
        if (!this.hasMessageQueue(sessionID))
        {
            return [];
        }

        return this.messageQueue[sessionID];
    }

    /* Pop first message from the queue for a particular sessionID and return the message. */
    popMessageFromQueue(sessionID)
    {
        if (!this.hasMessageQueue(sessionID))
        {
            return null;
        }

        return this.messageQueue[sessionID].splice(0, 1)[0];
    }

    /* Add notificationMessage to the messageQueue for a particular sessionID. */
    addToMessageQueue(notificationMessage, sessionID)
    {
        if (!this.hasMessageQueue(sessionID))
        {
            this.messageQueue[sessionID] = [notificationMessage];
            return;
        }

        this.messageQueue[sessionID].push(notificationMessage);
    }

    /* Checks whether we already have a message queue created for a particular sessionID. */
    hasMessageQueue(sessionID)
    {
        return sessionID in this.messageQueue;
    }

    /* Checks whether a particular sessionID has notifications waiting to be processed. */
    hasMessagesInQueue(sessionID)
    {
        if (!this.hasMessageQueue(sessionID))
        {
            return false;
        }

        return this.messageQueue[sessionID].length > 0;
    }

    async notificationWaitAsync(resp, sessionID)
    {
        await new Promise(resolve =>
        {
            // Timeout after 15 seconds even if no messages have been received to keep the poll requests going.
            setTimeout(() =>
            {
                resolve();
            }, 15000);

            setInterval(() =>
            {
                if (notifier_f.controller.hasMessagesInQueue(sessionID))
                {
                    resolve();
                }
            }, 300);
        });

        let data = [];

        while (this.hasMessagesInQueue(sessionID))
        {
            let message = this.popMessageFromQueue(sessionID);
            // Purposefully using default JSON stringify function here to avoid newline insertion
            // since the client expects different messages to be split by the newline character.
            data.push(JSON.stringify(message));
        }

        // If we timed out and don't have anything to send, just send a ping notification.
        if (data.length === 0)
        {
            data.push("{\"type\": \"ping\", \"eventId\": \"ping\"}");
        }

        server_f.server.sendTextJson(resp, data.join("\n"));
    }

    /* Creates a new notification of type "new_message" with the specified dialogueMessage object. */
    createNewMessageNotification(dialogueMessage)
    {
        return {type: "new_message", eventId: dialogueMessage._id, data : {"dialogId": dialogueMessage.uid, "message": dialogueMessage}};
    }
}

class Callbacks
{
    constructor()
    {
        server_f.server.respondCallback["NOTIFY"] = this.sendNotification.bind(this);
        router_f.router.staticRoutes["/client/notifier/channel/create"] = this.createNotifierChannel.bind(this);
        router_f.router.dynamicRoutes["/?last_id"] = this.notify.bind(this);
        router_f.router.dynamicRoutes["/notifierServer"] = this.notify.bind(this);
        router_f.router.dynamicRoutes["/notifierBase"] = this.getBaseNotifier.bind(this);
        router_f.router.dynamicRoutes["/push/notifier/get/"] = this.getNotifier.bind(this);
    }

    getBaseNotifier(url, info, sessionID)
    {
        return response_f.controller.emptyArrayResponse();
    }

    getNotifier(url, info, sessionID)
    {
        return response_f.controller.emptyArrayResponse();
    }

    // If we don't have anything to send, it's ok to not send anything back
    // because notification requests are long-polling. In fact, we SHOULD wait
    // until we actually have something to send because otherwise we'd spam the client
    // and the client would abort the connection due to spam.
    sendNotification(sessionID, req, resp, data)
    {
        let splittedUrl = req.url.split("/");

        sessionID = splittedUrl[splittedUrl.length - 1].split("?last_id")[0];
        notifier_f.controller.notificationWaitAsync(resp, sessionID);
    }

    createNotifierChannel(url, info, sessionID)
    {
        return response_f.controller.getBody({
            "notifier": {"server": server_f.server.backendUrl + "/",
                "channel_id": "testChannel",
                "url": server_f.server.backendUrl + "/notifierServer/get/" + sessionID},
            "notifierServer": server_f.server.backendUrl + "/notifierServer/get/" + sessionID
        });
    }

    notify(url, info, sessionID)
    {
        return "NOTIFY";
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
