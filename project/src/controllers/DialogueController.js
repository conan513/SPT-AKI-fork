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

const SaveServer = require("../servers/SaveServer.js");
const HashUtil = require("../utils/HashUtil.js");
const HttpResponse = require("../utils/HttpResponse.js");

class DialogueController
{
    static messageTypes = {
        "npcTrader": 2,
        "insuranceReturn": 8,
        "questStart": 10,
        "questFail": 11,
        "questSuccess": 12
    };

    /* Set the content of the dialogue on the list tab. */
    static generateDialogueList(sessionID)
    {
        let data = [];

        for (let dialogueId in SaveServer.profiles[sessionID].dialogues)
        {
            data.push(DialogueController.getDialogueInfo(dialogueId, sessionID));
        }

        return HttpResponse.getBody(data);
    }

    /* Get the content of a dialogue. */
    static getDialogueInfo(dialogueId, sessionID)
    {
        let dialogue = SaveServer.profiles[sessionID].dialogues[dialogueId];

        return {
            "_id": dialogueId,
            "type": 2, // Type npcTrader.
            "message": DialogueController.getMessagePreview(dialogue),
            "new": dialogue.new,
            "attachmentsNew": dialogue.attachmentsNew,
            "pinned": dialogue.pinned
        };
    }

    /*
	* Set the content of the dialogue on the details panel, showing all the messages
	* for the specified dialogue.
	*/
    static generateDialogueView(dialogueId, sessionID)
    {
        let dialogue = SaveServer.profiles[sessionID].dialogues[dialogueId];
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

        return HttpResponse.getBody({"messages": SaveServer.profiles[sessionID].dialogues[dialogueId].messages});
    }

    /*
	* Add a templated message to the dialogue.
	*/
    static addDialogueMessage(dialogueID, messageContent, sessionID, rewards = [])
    {
        let dialogueData = SaveServer.profiles[sessionID].dialogues;
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
            const stashId = HashUtil.generate();

            items.stash = stashId;
            items.data = [];
            rewards = Helpers.replaceIDs(null, rewards);

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
            "_id": HashUtil.generate(),
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

        const extraData = (messageContent.type === 4 && messageContent.ragfair) ? messageContent.ragfair : {};
        const notificationMessage = notifier_f.controller.createNewMessageNotification(message, extraData);
        https_f.server.sendMessage(notificationMessage, sessionID);
    }

    /*
	* Get the preview contents of the last message in a dialogue.
	*/
    static getMessagePreview(dialogue)
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
    static getMessageItemContents(messageId, sessionID)
    {
        let dialogueData = SaveServer.profiles[sessionID].dialogues;

        for (let dialogueId in dialogueData)
        {
            let messages = dialogueData[dialogueId].messages;

            for (let message of messages)
            {
                if (message._id === messageId)
                {
                    let attachmentsNew = SaveServer.profiles[sessionID].dialogues[dialogueId].attachmentsNew;
                    if (attachmentsNew > 0)
                    {
                        SaveServer.profiles[sessionID].dialogues[dialogueId].attachmentsNew = attachmentsNew - 1;
                    }
                    message.rewardCollected = true;
                    return message.items.data;
                }
            }
        }

        return [];
    }

    static removeDialogue(dialogueId, sessionID)
    {
        delete SaveServer.profiles[sessionID].dialogues[dialogueId];
    }

    static setDialoguePin(dialogueId, shouldPin, sessionID)
    {
        SaveServer.profiles[sessionID].dialogues[dialogueId].pinned = shouldPin;
    }

    static setRead(dialogueIds, sessionID)
    {
        let dialogueData = SaveServer.profiles[sessionID].dialogues;

        for (let dialogId of dialogueIds)
        {
            dialogueData[dialogId].new = 0;
            dialogueData[dialogId].attachmentsNew = 0;
        }

    }

    static getAllAttachments(dialogueId, sessionID)
    {
        let output = [];
        let timeNow = Date.now() / 1000;

        for (let message of SaveServer.profiles[sessionID].dialogues[dialogueId].messages)
        {
            if (timeNow < (message.dt + message.maxStorageTime))
            {
                output.push(message);
            }
        }

        SaveServer.profiles[sessionID].dialogues[dialogueId].attachmentsNew = 0;
        return {"messages": output};
    }

    static update()
    {
        for (const sessionID in SaveServer.profiles)
        {
            DialogueController.removeExpiredItems(sessionID);
        }
    }

    // deletion of items that has been expired. triggers when updating traders.
    static removeExpiredItems(sessionID)
    {
        for (let dialogueId in SaveServer.profiles[sessionID].dialogues)
        {
            for (let message of SaveServer.profiles[sessionID].dialogues[dialogueId].messages)
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
    static getMessageTypeValue(messageType)
    {
        return DialogueController.messageTypes[messageType];
    }
}

module.exports = DialogueController;
