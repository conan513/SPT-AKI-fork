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
    static getFriendList(url, info, sessionID)
    {
        return https_f.response.getBody({
            "Friends":[],
            "Ignore":[],
            "InIgnoreList":[]
        });
    }

    static getChatServerList(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "_id": HashUtil.generate(),
                "RegistrationId": 20,
                "DateTime": TimeUtil.getTimestamp(),
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

    static getMailDialogList(url, info, sessionID)
    {
        return dialogue_f.controller.generateDialogueList(sessionID);
    }

    static getMailDialogView(url, info, sessionID)
    {
        return dialogue_f.controller.generateDialogueView(info.dialogId, sessionID);
    }

    static getMailDialogInfo(url, info, sessionID)
    {
        return https_f.response.getBody(dialogue_f.controller.getDialogueInfo(info.dialogId, sessionID));
    }

    static removeDialog(url, info, sessionID)
    {
        dialogue_f.controller.removeDialogue(info.dialogId, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    static pinDialog(url, info, sessionID)
    {
        dialogue_f.controller.setDialoguePin(info.dialogId, true, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    static unpinDialog(url, info, sessionID)
    {
        dialogue_f.controller.setDialoguePin(info.dialogId, false, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    static setRead(url, info, sessionID)
    {
        dialogue_f.controller.setRead(info.dialogs, sessionID);
        return https_f.response.emptyArrayResponse();
    }

    static getAllAttachments(url, info, sessionID)
    {
        return https_f.response.getBody(dialogue_f.controller.getAllAttachments(info.dialogId, sessionID));
    }

    static listOutbox(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }

    static listInbox(url, info, sessionID)
    {
        return https_f.response.emptyArrayResponse();
    }

    static friendRequest(url, request, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static update()
    {
        dialogue_f.controller.update();
    }
}

module.exports = DialogueCallbacks;
