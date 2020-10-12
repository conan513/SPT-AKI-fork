/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.router.staticRoutes["/client/friend/list"] = this.getFriendList.bind(this);
        https_f.router.staticRoutes["/client/chatServer/list"] = this.getChatServerList.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/list"] = this.getMailDialogList.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/view"] = this.getMailDialogView.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/info"] = this.getMailDialogInfo.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/remove"] = this.removeDialog.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/pin"] = this.pinDialog.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/unpin"] = this.unpinDialog.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/read"] = this.setRead.bind(this);
        https_f.router.staticRoutes["/client/mail/dialog/getAllAttachments"] = this.getAllAttachments.bind(this);
        https_f.router.staticRoutes["/client/friend/request/list/outbox"] = this.listOutbox.bind(this);
        https_f.router.staticRoutes["/client/friend/request/list/inbox"] = this.listInbox.bind(this);
    }

    getFriendList(url, info, sessionID)
    {
        return https_f.response.getBody({"Friends":[], "Ignore":[], "InIgnoreList":[]});
    }

    getChatServerList(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "_id": "5ae20a0dcb1c13123084756f",
                "RegistrationId": 20,
                "DateTime": common_f.utility.getTimestamp(),
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
        return https_f.response.getBody(dialogue_f.controller.getDialogueInfo(info.dialogId, sessionID));
    }

    removeDialog(url, info, sessionID)
    {
        dialogue_f.controller.removeDialogue(info.dialogId, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    pinDialog(url, info, sessionID)
    {
        dialogue_f.controller.setDialoguePin(info.dialogId, true, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    unpinDialog(url, info, sessionID)
    {
        dialogue_f.controller.setDialoguePin(info.dialogId, false, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    setRead(url, info, sessionID)
    {
        dialogue_f.controller.setRead(info.dialogs, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    getAllAttachments(url, info, sessionID)
    {
        return https_f.response.getBody(dialogue_f.controller.getAllAttachments(info.dialogId, sessionID));
    }

    listOutbox(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }

    listInbox(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }
}

module.exports.Callbacks = Callbacks;
