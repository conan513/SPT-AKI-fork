/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

class Callbacks
{
    constructor()
    {
        router_f.router.staticRoutes["/client/friend/list"] = this.getFriendList.bind(this);
        router_f.router.staticRoutes["/client/chatServer/list"] = this.getChatServerList.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/list"] = this.getMailDialogList.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/view"] = this.getMailDialogView.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/info"] = this.getMailDialogInfo.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/remove"] = this.removeDialog.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/pin"] = this.pinDialog.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/unpin"] = this.unpinDialog.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/read"] = this.setRead.bind(this);
        router_f.router.staticRoutes["/client/mail/dialog/getAllAttachments"] = this.getAllAttachments.bind(this);
        router_f.router.staticRoutes["/client/friend/request/list/outbox"] = this.listOutbox.bind(this);
        router_f.router.staticRoutes["/client/friend/request/list/inbox"] = this.listInbox.bind(this);
    }

    getFriendList(url, info, sessionID)
    {
        return response_f.controller.getBody({"Friends":[], "Ignore":[], "InIgnoreList":[]});
    }

    getChatServerList(url, info, sessionID)
    {
        return response_f.controller.getBody([
            {
                "_id": "5ae20a0dcb1c13123084756f",
                "RegistrationId": 20,
                "DateTime": Math.floor(new Date() / 1000),
                "IsDeveloper": true,
                "Regions": ["EUR"],
                "VersionId": "bgkidft87ddd",
                "Ip": "",
                "Port": 0,
                "Chats": [
                    {
                        "_id": "0",
                        "Members": 0
                    }
                ]
            }
        ]);
    }

    getMailDialogList(url, info, sessionID)
    {
        return dialogue_f.controller.generateDialogueList(sessionID);
    }

    getMailDialogView(url, info, sessionID)
    {
        return dialogue_f.controller.generateDialogueView(info.dialogId, sessionID);
    }

    getMailDialogInfo(url, info, sessionID)
    {
        return response_f.controller.getBody(dialogue_f.controller.getDialogueInfo(info.dialogId, sessionID));
    }

    removeDialog(url, info, sessionID)
    {
        dialogue_f.controller.removeDialogue(info.dialogId, sessionID);
        return response_f.controller.emptyArrayResponse();
    }

    pinDialog(url, info, sessionID)
    {
        dialogue_f.controller.setDialoguePin(info.dialogId, true, sessionID);
        return response_f.controller.emptyArrayResponse();
    }

    unpinDialog(url, info, sessionID)
    {
        dialogue_f.controller.setDialoguePin(info.dialogId, false, sessionID);
        return response_f.controller.emptyArrayResponse();
    }

    setRead(url, info, sessionID)
    {
        dialogue_f.controller.setRead(info.dialogs, sessionID);
        return response_f.controller.emptyArrayResponse();
    }

    getAllAttachments(url, info, sessionID)
    {
        return response_f.controller.getBody(dialogue_f.controller.getAllAttachments(info.dialogId, sessionID));
    }

    listOutbox(url, info, sessionID)
    {
        return response_f.controller.emptyArrayResponse();
    }

    listInbox(url, info, sessionID)
    {
        return response_f.controller.emptyArrayResponse();
    }
}

module.exports.Callbacks = Callbacks;
