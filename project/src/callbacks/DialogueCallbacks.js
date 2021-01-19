/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class DialogueCallbacks
{
    constructor()
    {
        core_f.packager.onUpdate["dialogue"] = this.update.bind(this);
        https_f.router.addStaticRoute("/client/friend/list", "Aki", this.getFriendList.bind(this));
        https_f.router.addStaticRoute("/client/chatServer/list", "Aki", this.getChatServerList.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/list", "Aki", this.getMailDialogList.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/view", "Aki", this.getMailDialogView.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/info", "Aki", this.getMailDialogInfo.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/remove", "Aki", this.removeDialog.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/pin", "Aki", this.pinDialog.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/unpin", "Aki", this.unpinDialog.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/read", "Aki", this.setRead.bind(this));
        https_f.router.addStaticRoute("/client/mail/dialog/getAllAttachments", "Aki", this.getAllAttachments.bind(this));
        https_f.router.addStaticRoute("/client/friend/request/list/outbox", "Aki", this.listOutbox.bind(this));
        https_f.router.addStaticRoute("/client/friend/request/list/inbox", "Aki", this.listInbox.bind(this));
        https_f.router.addStaticRoute("/client/friend/request/send", "Aki", this.friendRequest.bind(this));
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
                "DateTime": common_f.time.getTimestamp(),
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

    friendRequest(url, request, sessionID)
    {
        return https_f.response.nullResponse();
    }

    update()
    {
        dialogue_f.controller.update();
    }
}

module.exports = new DialogueCallbacks();
