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
