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
        this.messageQueue = {};

        this.pollInterval = 300;

        this.timeout = 15000;

        /**
         * The default notification sent when waiting times out.
         */
        this.defaultMessage = {
            type: "ping",
            eventId: "ping"
        };
    }

    /**
     * Get message queue for session
     *
     * @param sessionID
     */
    get(sessionID)
    {
        if (!sessionID)
        {
            throw new Error("sessionID missing");
        }

        if (!this.messageQueue[sessionID])
        {
            this.messageQueue[sessionID] = [];
        }

        return this.messageQueue[sessionID];
    }

    /**
     * Add message to queue
     */
    add(message, sessionID)
    {
        this.get(sessionID).push(message);
    }

    has(sessionID)
    {
        return this.get(sessionID).length > 0;
    }

    /**
     * Pop first message from queue.
     */
    pop(sessionID)
    {
        return this.get(sessionID).shift();
    }

    /**
     * Resolve an array of session notifications.
     *
     * If no notifications are currently queued then intermittently check for new notifications until either
     *  one or more appear or when a timeout expires.
     *
     * If no notifications are available after the timeout, use a default message.
     */
    notifyAsync(sessionID)
    {
        return new Promise((resolve) =>
        {
            let counter = 0; // keep track of our timeout

            /**
             * Check for notifications, resolve if any, otherwise poll
             *  intermittently for a period of time.
             */
            const checkNotifications = () =>
            {
                /**
                 * If there are no pending messages we should either check again later
                 *  or timeout now with a default response.
                 */
                if (!this.has(sessionID))
                {
                    // have we exceeded timeout? if so reply with default ping message
                    if (counter > this.timeout)
                    {
                        return resolve([this.defaultMessage]);
                    }

                    // check again
                    setTimeout(checkNotifications, this.pollInterval);

                    // update our timeout counter
                    counter += this.pollInterval;

                    return;
                }

                /**
                 * Maintaining array reference is not necessary, so we can just copy and reinitialize
                 */
                const messages = this.get(sessionID);

                this.messageQueue[sessionID] = [];

                resolve(messages);
            };

            // immediately check
            checkNotifications();
        });
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
}

module.exports.Controller = Controller;
