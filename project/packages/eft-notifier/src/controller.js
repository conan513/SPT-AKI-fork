/* controller.js
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

    /* Checks whether we already have a message queue created for a particular sessionID. */
    hasMessageQueue(sessionID)
    {
        return sessionID in this.messageQueue;
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
            data.push(common_f.json.stringify(message));
        }

        // If we timed out and don't have anything to send, just send a ping notification.
        if (data.length === 0)
        {
            data.push(common_f.json.stringify({
                "type": "ping",
                "eventId": "ping"
            }));
        }

        https_f.server.sendTextJson(resp, data.join("\n"));
    }

    /* Creates a new notification of type "new_message" with the specified dialogueMessage object. */
    createNewMessageNotification(dialogueMessage)
    {
        return {
            "type": "new_message",
            "eventId": dialogueMessage._id,
            "data" : {
                "dialogId": dialogueMessage.uid,
                "message": dialogueMessage
            }
        };
    }
}

module.exports.Controller = Controller;
