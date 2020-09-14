"use strict";

class DialogueServer
{
    constructor()
    {
        this.dialogues = {};
        this.messageTypes = {
            "npcTrader": 2,
            "insuranceReturn": 8,
            "questStart": 10,
            "questFail": 11,
            "questSuccess": 12
        };
    }

    initializeDialogue(sessionID)
    {
        this.dialogues[sessionID] = json.parse(json.read(this.getPath(sessionID)));
    }

    saveToDisk(sessionID)
    {
        if (sessionID in this.dialogues)
        {
            json.write(this.getPath(sessionID), this.dialogues[sessionID]);
        }
    }

    /* Set the content of the dialogue on the list tab. */
    generateDialogueList(sessionID)
    {
        let data = [];

        for (let dialogueId in this.dialogues[sessionID])
        {
            data.push(this.getDialogueInfo(dialogueId, sessionID));
        }

        return response_f.responseController.getBody(data);
    }

    /* Get the content of a dialogue. */
    getDialogueInfo(dialogueId, sessionID)
    {
        let dialogue = this.dialogues[sessionID][dialogueId];

        return {
            "_id": dialogueId,
            "type": 2, // Type npcTrader.
            "message": this.getMessagePreview(dialogue),
            "new": dialogue.new,
            "attachmentsNew": dialogue.attachmentsNew,
            "pinned": dialogue.pinned
        };
    }

    /*
	* Set the content of the dialogue on the details panel, showing all the messages
	* for the specified dialogue.
	*/
    generateDialogueView(dialogueId, sessionID)
    {
        let dialogue = this.dialogues[sessionID][dialogueId];
        dialogue.new = 0;

        // Set number of new attachments, but ignore those that have expired.
        let attachmentsNew = 0;
        let currDt = Date.now() / 1000;

        for (let message of dialogue.messages)
        {
            if (message.hasRewards && !message.rewardCollected && currDt < (message.dt + message.maxStorageTime))
            {
                attachmentsNew++;
            }
        }

        dialogue.attachmentsNew = attachmentsNew;

        return response_f.responseController.getBody({"messages": this.dialogues[sessionID][dialogueId].messages});
    }

    /*
	* Add a templated message to the dialogue.
	*/
    addDialogueMessage(dialogueID, messageContent, sessionID, rewards = [])
    {
        if (this.dialogues[sessionID] === undefined)
        {
            this.initializeDialogue(sessionID);
        }

        let dialogueData = this.dialogues[sessionID];
        let isNewDialogue = !(dialogueID in dialogueData);
        let dialogue = dialogueData[dialogueID];

        if (isNewDialogue)
        {
            dialogue = {
                "_id": dialogueID,
                "messages": [],
                "pinned": false,
                "new": 0,
                "attachmentsNew": 0
            };

            dialogueData[dialogueID] = dialogue;
        }

        dialogue.new += 1;

        // Generate item stash if we have rewards.
        let items = {};

        if (rewards.length > 0)
        {
            const stashId = utility.generateNewItemId();

            items.stash = stashId;
            items.data = [];
            rewards = helpfunc_f.helpFunctions.replaceIDs(null, rewards);

            for (let reward of rewards)
            {
                if (!("slotId" in reward) || reward.slotId === "hideout")
                {
                    reward.parentId = stashId;
                    reward.slotId = "main";
                }

                items.data.push(reward);
            }

            dialogue.attachmentsNew += 1;
        }

        let message = {
            "_id": utility.generateNewDialogueId(),
            "uid": dialogueID,
            "type": messageContent.type,
            "dt": Date.now() / 1000,
            "templateId": messageContent.templateId,
            "text": messageContent.text,
            "hasRewards": rewards.length > 0,
            "rewardCollected": false,
            "items": items,
            "maxStorageTime": messageContent.maxStorageTime,
            "systemData": messageContent.systemData
        };

        dialogue.messages.push(message);

        let notificationMessage = notifier_f.notifierService.createNewMessageNotification(message);
        notifier_f.notifierService.addToMessageQueue(notificationMessage, sessionID);
    }

    /*
	* Get the preview contents of the last message in a dialogue.
	*/
    getMessagePreview(dialogue)
    {
        // The last message of the dialogue should be shown on the preview.
        let message = dialogue.messages[dialogue.messages.length - 1];

        return {
            "dt": message.dt,
            "type": message.type,
            "templateId": message.templateId,
            "uid": dialogue._id
        };
    }

    /*
	* Get the item contents for a particular message.
	*/
    getMessageItemContents(messageId, sessionID)
    {
        let dialogueData = this.dialogues[sessionID];

        for (let dialogueId in dialogueData)
        {
            let messages = dialogueData[dialogueId].messages;

            for (let message of messages)
            {
                if (message._id === messageId)
                {
                    let attachmentsNew = this.dialogues[sessionID][dialogueId].attachmentsNew;
                    if (attachmentsNew > 0)
                    {
                        this.dialogues[sessionID][dialogueId].attachmentsNew = attachmentsNew - 1;
                    }
                    message.rewardCollected = true;
                    return message.items.data;
                }
            }
        }

        return [];
    }

    removeDialogue(dialogueId, sessionID)
    {
        delete this.dialogues[sessionID][dialogueId];
    }

    setDialoguePin(dialogueId, shouldPin, sessionID)
    {
        this.dialogues[sessionID][dialogueId].pinned = shouldPin;
    }

    setRead(dialogueIds, sessionID)
    {
        let dialogueData = this.dialogues[sessionID];

        for (let dialogId of dialogueIds)
        {
            dialogueData[dialogId].new = 0;
            dialogueData[dialogId].attachmentsNew = 0;
        }

    }

    getAllAttachments(dialogueId, sessionID)
    {
        let output = [];
        let timeNow = Date.now() / 1000;

        for (let message of this.dialogues[sessionID][dialogueId].messages)
        {
            if (timeNow < (message.dt + message.maxStorageTime))
            {
                output.push(message);
            }
        }

        this.dialogues[sessionID][dialogueId].attachmentsNew = 0;
        return {"messages": output};
    }


    // deletion of items that has been expired. triggers when updating traders.

    removeExpiredItems(sessionID)
    {
        for (let dialogueId in this.dialogues[sessionID])
        {
            for (let message of this.dialogues[sessionID][dialogueId].messages)
            {
                if ((Date.now() / 1000) > (message.dt + message.maxStorageTime))
                {
                    message.items = {};
                }
            }
        }
    }

    /*
    * Return the int value associated with the messageType, for readability.
    */
    getMessageTypeValue(messageType)
    {
        return this.messageTypes[messageType];
    }

    getPath(sessionID)
    {
        let path = db.user.profiles.dialogue;
        return path.replace("__REPLACEME__", sessionID);
    }
}

class DialogueCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/friend/list", this.getFriendList.bind());
        router.addStaticRoute("/client/chatServer/list", this.getChatServerList.bind());
        router.addStaticRoute("/client/mail/dialog/list", this.getMailDialogList.bind());
        router.addStaticRoute("/client/mail/dialog/view", this.getMailDialogView.bind());
        router.addStaticRoute("/client/mail/dialog/info", this.getMailDialogInfo.bind());
        router.addStaticRoute("/client/mail/dialog/remove", this.removeDialog.bind());
        router.addStaticRoute("/client/mail/dialog/pin", this.pinDialog.bind());
        router.addStaticRoute("/client/mail/dialog/unpin", this.unpinDialog.bind());
        router.addStaticRoute("/client/mail/dialog/read", this.setRead.bind());
        router.addStaticRoute("/client/mail/dialog/getAllAttachments", this.getAllAttachments.bind());
        router.addStaticRoute("/client/friend/request/list/outbox", this.listOutbox.bind());
        router.addStaticRoute("/client/friend/request/list/inbox", this.listInbox.bind());
    }

    getFriendList(url, info, sessionID)
    {
        return response_f.responseController.getBody({"Friends":[], "Ignore":[], "InIgnoreList":[]});
    }

    getChatServerList(url, info, sessionID)
    {
        return response_f.responseController.getBody([{"_id": "5ae20a0dcb1c13123084756f", "RegistrationId": 20, "DateTime": Math.floor(new Date() / 1000), "IsDeveloper": true, "Regions": ["EUR"], "VersionId": "bgkidft87ddd", "Ip": "", "Port": 0, "Chats": [{"_id": "0", "Members": 0}]}]);
    }

    getMailDialogList(url, info, sessionID)
    {
        return dialogue_f.dialogueServer.generateDialogueList(sessionID);
    }

    getMailDialogView(url, info, sessionID)
    {
        return dialogue_f.dialogueServer.generateDialogueView(info.dialogId, sessionID);
    }

    getMailDialogInfo(url, info, sessionID)
    {
        return response_f.responseController.getBody(dialogue_f.dialogueServer.getDialogueInfo(info.dialogId, sessionID));
    }

    removeDialog(url, info, sessionID)
    {
        dialogue_f.dialogueServer.removeDialogue(info.dialogId, sessionID);
        return response_f.responseController.emptyArrayResponse();
    }

    pinDialog(url, info, sessionID)
    {
        dialogue_f.dialogueServer.setDialoguePin(info.dialogId, true, sessionID);
        return response_f.responseController.emptyArrayResponse();
    }

    unpinDialog(url, info, sessionID)
    {
        dialogue_f.dialogueServer.setDialoguePin(info.dialogId, false, sessionID);
        return response_f.responseController.emptyArrayResponse();
    }

    setRead(url, info, sessionID)
    {
        dialogue_f.dialogueServer.setRead(info.dialogs, sessionID);
        return response_f.responseController.emptyArrayResponse();
    }

    getAllAttachments(url, info, sessionID)
    {
        return response_f.responseController.getBody(dialogue_f.dialogueServer.getAllAttachments(info.dialogId, sessionID));
    }

    listOutbox(url, info, sessionID)
    {
        return response_f.responseController.emptyArrayResponse();
    }

    listInbox(url, info, sessionID)
    {
        return response_f.responseController.emptyArrayResponse();
    }
}

module.exports.dialogueServer = new DialogueServer();
module.exports.dialogueCallbacks = new DialogueCallbacks();
