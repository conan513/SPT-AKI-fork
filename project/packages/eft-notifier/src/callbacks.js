/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
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
        https_f.router.onDynamicRoute["/notifierBase"] = this.getBaseNotifier.bind(this);
        https_f.router.onDynamicRoute["/push/notifier/get/"] = this.getNotifier.bind(this);
    }

    getBaseNotifier(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }

    getNotifier(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }

    // If we don't have anything to send, it's ok to not send anything back
    // because notification requests are long-polling. In fact, we SHOULD wait
    // until we actually have something to send because otherwise we'd spam the client
    // and the client would abort the connection due to spam.
    sendNotification(sessionID, req, resp, data)
    {
        const splittedUrl = req.url.split("/");

        sessionID = splittedUrl[splittedUrl.length - 1].split("?last_id")[0];
        notifier_f.controller.notificationWaitAsync(resp, sessionID);
    }

    createNotifierChannel(url, info, sessionID)
    {
        return https_f.response.getBody({
            "notifier": {
                "server": `${https_f.config.backendUrl}/`,
                "channel_id": "testChannel",
                "url": `${https_f.config.backendUrl}/notifierServer/get/${sessionID}`
            },
            "notifierServer": `${https_f.config.backendUrl}/notifierServer/get/${sessionID}`
        });
    }

    notify(url, info, sessionID)
    {
        return "NOTIFY";
    }

    selectProfile(url, info, sessionID)
    {
        return https_f.response.getBody({
            "status": "ok",
            "notifier": {
                "server": `${https_f.config.backendUrl}/`,
                "channel_id": "testChannel"
            }
        });
    }
}

module.exports.Callbacks = Callbacks;
