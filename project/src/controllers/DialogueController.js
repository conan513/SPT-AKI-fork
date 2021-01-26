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

class DialogueController
{
    constructor()
    {
        this.messageTypes = {
            "npcTrader": 2,
            "insuranceReturn": 8,
            "questStart": 10,
            "questFail": 11,
            "questSuccess": 12
        };
    }

    /* Set the content of the dialogue on the list tab. */
    generateDialogueList(sessionID)
    {
        let data = [];

        for (let dialogueId in save_f.server.profiles[sessionID].dialogues)
        {
            data.push(this.getDialogueInfo(dialogueId, sessionID));
        }

        return https_f.response.getBody(data);
    }

    /* Get the content of a dialogue. */
    getDialogueInfo(dialogueId, sessionID)
    {
        let dialogue = save_f.server.profiles[sessionID].dialogues[dialogueId];

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
        let dialogue = save_f.server.profiles[sessionID].dialogues[dialogueId];
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

        return https_f.response.getBody({"messages": save_f.server.profiles[sessionID].dialogues[dialogueId].messages});
    }

    /*
	* Add a templated message to the dialogue.
	*/
    addDialogueMessage(dialogueID, messageContent, sessionID, rewards = [])
    {
        let dialogueData = save_f.server.profiles[sessionID].dialogues;
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
        https_f.server.sendMessage(notificationMessage);
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
        let dialogueData = save_f.server.profiles[sessionID].dialogues;

        for (let dialogueId in dialogueData)
        {
            let messages = dialogueData[dialogueId].messages;

            for (let message of messages)
            {
                if (message._id === messageId)
                {
                    let attachmentsNew = save_f.server.profiles[sessionID].dialogues[dialogueId].attachmentsNew;
                    if (attachmentsNew > 0)
                    {
                        save_f.server.profiles[sessionID].dialogues[dialogueId].attachmentsNew = attachmentsNew - 1;
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
        delete save_f.server.profiles[sessionID].dialogues[dialogueId];
    }

    setDialoguePin(dialogueId, shouldPin, sessionID)
    {
        save_f.server.profiles[sessionID].dialogues[dialogueId].pinned = shouldPin;
    }

    setRead(dialogueIds, sessionID)
    {
        let dialogueData = save_f.server.profiles[sessionID].dialogues;

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

        for (let message of save_f.server.profiles[sessionID].dialogues[dialogueId].messages)
        {
            if (timeNow < (message.dt + message.maxStorageTime))
            {
                output.push(message);
            }
        }

        save_f.server.profiles[sessionID].dialogues[dialogueId].attachmentsNew = 0;
        return {"messages": output};
    }

    update()
    {
        for (const sessionID in save_f.server.profiles)
        {
            this.removeExpiredItems(sessionID);
        }
    }

    // deletion of items that has been expired. triggers when updating traders.
    removeExpiredItems(sessionID)
    {
        for (let dialogueId in save_f.server.profiles[sessionID].dialogues)
        {
            for (let message of save_f.server.profiles[sessionID].dialogues[dialogueId].messages)
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
}

module.exports = new DialogueController();
