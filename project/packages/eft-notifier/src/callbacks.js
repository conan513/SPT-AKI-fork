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
        server_f.server.respondCallback["NOTIFY"] = this.sendNotification.bind(this);
        router_f.router.staticRoutes["/client/notifier/channel/create"] = this.createNotifierChannel.bind(this);
        router_f.router.staticRoutes["/client/game/profile/select"] = this.selectProfile.bind(this);
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
        const splittedUrl = req.url.split("/");

        sessionID = splittedUrl[splittedUrl.length - 1].split("?last_id")[0];
        notifier_f.controller.notificationWaitAsync(resp, sessionID);
    }

    createNotifierChannel(url, info, sessionID)
    {
        return response_f.controller.getBody({
            "notifier": {
                "server": `${server_f.server.backendUrl}/`,
                "channel_id": "testChannel",
                "url": `${server_f.server.backendUrl}/notifierServer/get/${sessionID}`
            },
            "notifierServer": `${server_f.server.backendUrl}/notifierServer/get/${sessionID}`
        });
    }

    notify(url, info, sessionID)
    {
        return "NOTIFY";
    }

    selectProfile(url, info, sessionID)
    {
        return response_f.controller.getBody({
            "status": "ok",
            "notifier": {
                "server": `${server_f.server.backendUrl}/`,
                "channel_id": "testChannel"
            }
        });
    }
}

module.exports.Callbacks = Callbacks;
