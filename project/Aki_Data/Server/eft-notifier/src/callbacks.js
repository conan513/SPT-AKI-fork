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

class Callbacks
{
    constructor()
    {
        https_f.server.onRespond["NOTIFY"] = this.sendNotification.bind(this);
        https_f.router.onStaticRoute["/client/notifier/channel/create"] = this.createNotifierChannel.bind(this);
        https_f.router.onStaticRoute["/client/game/profile/select"] = this.selectProfile.bind(this);
        https_f.router.onDynamicRoute["/?last_id"] = this.notify.bind(this);
        https_f.router.onDynamicRoute["/notifierServer"] = this.notify.bind(this);
        https_f.router.onDynamicRoute["/push/notifier/get/"] = this.getNotifier.bind(this);
        https_f.router.onDynamicRoute["/push/notifier/getwebsocket/"] = this.getNotifier.bind(this);
    }

    getNotifier(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }

    // If we don't have anything to send, it's ok to not send anything back
    // because notification requests can be long-polling. In fact, we SHOULD wait
    // until we actually have something to send because otherwise we'd spam the client
    // and the client would abort the connection due to spam.
    sendNotification(sessionID, req, resp, data)
    {
        const splittedUrl = req.url.split("/");

        sessionID = splittedUrl[splittedUrl.length - 1].split("?last_id")[0];

        notifier_f.controller.notifyAsync(sessionID)
            /**
             * Take our array of JSON message objects and cast them to JSON strings, so that they can then
             *  be sent to client as NEWLINE separated strings... yup.
             */
            .then((messages) => messages.map(message => JSON.stringify(message)).join("\n"))
            .then((text) => https_f.server.sendTextJson(resp, text));
    }

    createNotifierChannel(url, info, sessionID)
    {
        return https_f.response.getBody(notifier_f.controller.getChannel(sessionID));
    }

    notify(url, info, sessionID)
    {
        return "NOTIFY";
    }

    selectProfile(url, info, sessionID)
    {
        return https_f.response.getBody({
            "status": "ok",
            "notifier": notifier_f.controller.getChannel(sessionID),
            "notifierServer": notifier_f.controller.getServer(sessionID)
        });
    }
}

module.exports.Callbacks = Callbacks;
