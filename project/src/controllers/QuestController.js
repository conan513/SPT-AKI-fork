"use strict";

require("../Lib.js");

class QuestController
{
    static getClientQuests(sessionID)
    {
        let quests = [];
        let allQuests = QuestController.questValues();
        const profile = ProfileController.getPmcProfile(sessionID);

        for (let quest of allQuests)
        {
            // If a quest is already in the profile we need to just add it
            if (profile.Quests.includes(pq => pq.qid === quest._id))
            {
                quests.push(quest);
                continue;
            }

            // Don't add quests that have a level higher than the user's
            const levels = QuestHelper.getLevelConditions(quest.conditions.AvailableForStart);

            if (levels.length)
            {
                if (!QuestHelper.evaluateLevel(profile, levels[0]))
                {
                    continue;
                }
            }

            // If the quest has no quest conditions then add to visible quest list
            const conditions = QuestHelper.getQuestConditions(quest.conditions.AvailableForStart);

            if (conditions.length === 0)
            {
                quests.push(quest);
                continue;
            }

            let canSend = true;

            // Check the status of each quest condition, if any are not completed
            // then this quest should not be visible
            for (const condition of conditions)
            {
                const previousQuest = profile.Quests.find(pq => pq.qid === condition._props.target);

                // If the previous quest isn't in the user profile, it hasn't been completed or started
                if (!previousQuest)
                {
                    canSend = false;
                    break;
                }

                // If previous is in user profile, check condition requirement and current status
                if (previousQuest.status === Object.keys(QuestHelper.status)[condition._props.status[0]])
                {
                    continue;
                }

                // Chemical fix: "Started" Status is catered for above. This will include it just if it's started.
                // but maybe this is better:
                // if ((condition._props.status[0] === QuestHelper.status.Started)
                // && (previousQuest.status === "AvailableForFinish" || previousQuest.status ===  "Success")
                if ((condition._props.status[0] === QuestHelper.status.Started))
                {
                    let statusName = Object.keys(QuestHelper.status)[condition._props.status[0]];
                    Logger.debug(`[QUESTS]: fix for polikhim bug: ${quest._id} (${QuestHelper.getQuestLocale(quest._id).name}) ${condition._props.status[0]}, ${statusName} != ${previousQuest.status}`);
                    continue;
                }
                canSend = false;
                break;
            }

            if (canSend)
            {
                quests.push(QuestController.cleanQuestConditions(quest));
            }
        }
        return quests;
    }

    static getFindItemIdForQuestItem(itemTpl)
    {
        for (const quest of QuestController.questValues())
        {
            const conditions = quest.conditions.AvailableForFinish.filter(
                c =>
                {
                    return c._parent === "FindItem";
                });

            for (const condition of conditions)
            {
                if (condition._props.target.includes(itemTpl))
                {
                    return condition._props.id;
                }
            }
        }
    }

    static processReward(reward)
    {
        let rewardItems = [];
        let targets = [];
        let mods = [];

        let itemCount = 1;

        for (let item of reward.items)
        {
            // reward items are granted Found in Raid
            if (!item.upd)
            {
                item.upd = {};
            }

            item.upd.SpawnedInSession = true;

            // separate base item and mods, fix stacks
            if (item._id === reward.target)
            {
                if ((item.parentId !== undefined) && (item.parentId === "hideout") && (item.upd !== undefined) && (item.upd.StackObjectsCount !== undefined) && (item.upd.StackObjectsCount > 1))
                {
                    itemCount = item.upd.StackObjectsCount;
                    item.upd.StackObjectsCount = 1;
                }
                targets = ItemHelper.splitStack(item);
            }
            else
            {
                mods.push(item);
            }
        }

        // add mods to the base items, fix ids
        for (const target of targets)
        {
            let items = [target];

            for (const mod of mods)
            {
                items.push(JsonUtil.clone(mod));
            }

            for (let i = 0; i < itemCount; i++)
                rewardItems = rewardItems.concat(ItemHelper.replaceIDs(null, items));
        }

        return rewardItems;
    }

    /* Gets a flat list of reward items for the given quest and state
    * input: quest, a quest object
    * input: state, the quest status that holds the items (Started, Success, Fail)
    * output: an array of items with the correct maxStack
    */
    static getQuestRewardItems(quest, state)
    {
        let questRewards = [];

        for (const reward of quest.rewards[state])
        {
            if ("Item" === reward.type)
            {
                questRewards = questRewards.concat(QuestController.processReward(reward));
            }
        }

        return questRewards;
    }

    static applyQuestReward(pmcData, body, state, sessionID)
    {
        let intelCenterBonus = 0;//percentage of money reward

        //find if player has money reward boost
        for (const area of pmcData.Hideout.Areas)
        {
            if (area.type === 11)
            {
                if (area.level === 1)
                {
                    intelCenterBonus = 5;
                }

                if (area.level > 1)
                {
                    intelCenterBonus = 15;
                }
            }
        }

        for (const quest in pmcData.Quests)
        {
            if (pmcData.Quests[quest].qid === body.qid)
            {
                pmcData.Quests[quest].status = state;
                break;
            }
        }

        // give reward
        let quest = DatabaseServer.tables.templates.quests[body.qid];

        if (intelCenterBonus > 0)
        {
            quest = QuestController.applyMoneyBoost(quest, intelCenterBonus);    //money = money + (money*intelCenterBonus/100)
        }

        for (const reward of quest.rewards[state])
        {
            switch (reward.type)
            {
                case "Skill":
                    pmcData = ProfileController.getPmcProfile(sessionID);

                    for (let skill of pmcData.Skills.Common)
                    {
                        if (skill.Id === reward.target)
                        {
                            skill.Progress += parseInt(reward.value);
                            break;
                        }
                    }
                    break;

                case "Experience":
                    pmcData = ProfileController.getPmcProfile(sessionID);
                    pmcData.Info.Experience += parseInt(reward.value);
                    break;

                case "TraderStanding":
                    pmcData = ProfileController.getPmcProfile(sessionID);
                    pmcData.TradersInfo[reward.target].standing += parseFloat(reward.value);

                    if (pmcData.TradersInfo[reward.target].standing < 0)
                    {
                        pmcData.TradersInfo[reward.target].standing = 0;
                    }

                    TraderController.lvlUp(reward.target, sessionID);
                    break;

                case "TraderUnlock":
                    TraderController.changeTraderDisplay(reward.target, true, sessionID);
                    break;
            }
        }

        return QuestController.getQuestRewardItems(quest, state);
    }

    static acceptQuest(pmcData, body, sessionID)
    {
        const time = TimeUtil.getTimestamp();
        const state = "Started";
        let quest = pmcData.Quests.find((q) =>
        {
            return q.qid === body.qid;
        });

        if (quest)
        {
            // If the quest already exists, update its status
            quest.startTime = time;
            quest.status = state;
        }
        else
        {
            // If the quest doesn't exists, add it
            pmcData.Quests.push({
                "qid": body.qid,
                "startTime": time,
                "status": state,
                "completedConditions": []
            });
        }

        // Create a dialog message for starting the quest.
        // Note that for starting quests, the correct locale field is "description", not "startedMessageText".
        let questDb = DatabaseServer.tables.templates.quests[body.qid];
        let questLocale = DatabaseServer.tables.locales.global["en"].quest[body.qid];
        let questRewards = QuestController.getQuestRewardItems(questDb, state);
        let messageContent = {
            "templateId": questLocale.startedMessageText,
            "type": DialogueController.getMessageTypeValue("questStart"),
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        if (questLocale.startedMessageText === "" || questLocale.startedMessageText.length === 24)
        {
            messageContent = {
                "templateId": questLocale.description,
                "type": DialogueController.getMessageTypeValue("questStart"),
                "maxStorageTime": QuestConfig.redeemTime * 3600
            };
        }

        DialogueController.addDialogueMessage(questDb.traderId, messageContent, sessionID, questRewards);

        let acceptQuestResponse = ItemEventRouter.getOutput(sessionID);
        acceptQuestResponse.profileChanges[sessionID].quests = QuestController.acceptedUnlocked(body.qid, sessionID);
        return acceptQuestResponse;
    }

    static completeQuest(pmcData, body, sessionID)
    {
        const beforeQuests = QuestController.getClientQuests(sessionID);
        let questRewards = QuestController.applyQuestReward(pmcData, body, "Success", sessionID);

        //Check if any of linked quest is failed, and that is unrestartable.
        const checkQuest = QuestController.questValues().filter((q) =>
        {
            return q.conditions.Fail.length > 0 && q.conditions.Fail[0]._props.target === body.qid;
        });

        for (const checkFail of checkQuest)
        {
            if (checkFail.conditions.Fail[0]._props.status[0] === QuestHelper.status.Success)
            {
                const checkQuestId = pmcData.Quests.find(qq => qq.qid === checkFail._id);

                if (checkQuestId)
                {
                    const failBody = { "Action": "QuestComplete", "qid": checkFail._id, "removeExcessItems": true };
                    QuestController.failQuest(pmcData, failBody, sessionID);
                }
                else
                {
                    const questData = {
                        "qid": checkFail._id,
                        "startTime": TimeUtil.getTimestamp(),
                        "status": "Fail"
                    };
                    pmcData.Quests.push(questData);
                }
            }
        }

        // Create a dialog message for completing the quest.
        let quest = DatabaseServer.tables.templates.quests[body.qid];
        const questLocale = DatabaseServer.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.successMessageText,
            "type": DialogueController.getMessageTypeValue("questSuccess"),
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        DialogueController.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        let completeQuestResponse = ItemEventRouter.getOutput(sessionID);
        completeQuestResponse.profileChanges[sessionID].quests = QuestHelper.getDeltaQuests(beforeQuests, QuestController.getClientQuests(sessionID));
        QuestHelper.dumpQuests(completeQuestResponse.profileChanges[sessionID].quests);
        Object.assign(completeQuestResponse.profileChanges[sessionID].traderRelations, pmcData.TradersInfo);
        return completeQuestResponse;
    }

    static failQuest(pmcData, body, sessionID)
    {
        let questRewards = QuestController.applyQuestReward(pmcData, body, "Fail", sessionID);

        // Create a dialog message for completing the quest.
        const quest = DatabaseServer.tables.templates.quests[body.qid];
        const questLocale = DatabaseServer.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.failMessageText,
            "type": DialogueController.getMessageTypeValue("questFail"),
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        DialogueController.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        let failedQuestResponse = ItemEventRouter.getOutput(sessionID);
        failedQuestResponse.profileChanges[sessionID].quests = QuestController.failedUnlocked(body.qid, sessionID);

        return failedQuestResponse;
    }

    static handoverQuest(pmcData, body, sessionID)
    {
        const quest = DatabaseServer.tables.templates.quests[body.qid];
        const types = ["HandoverItem", "WeaponAssembly"];
        let output = ItemEventRouter.getOutput(sessionID);
        let handoverMode = true;
        let value = 0;
        let counter = 0;
        let amount;

        for (let condition of quest.conditions.AvailableForFinish)
        {
            if (condition._props.id === body.conditionId && types.includes(condition._parent))
            {
                value = parseInt(condition._props.value);
                handoverMode = condition._parent === types[0];
                break;
            }
        }

        if (handoverMode && value === 0)
        {
            Logger.error(`Quest handover error: condition not found or incorrect value. qid=${body.qid}, condition=${body.conditionId}`);
            return output;
        }

        for (const itemHandover of body.items)
        {
            // remove the right quantity of given items
            amount = Math.min(itemHandover.count, value - counter);
            counter += amount;
            if (itemHandover.count - amount > 0)
            {
                QuestController.changeItemStack(pmcData, itemHandover.id, itemHandover.count - amount, sessionID, output);
                if (counter === value)
                {
                    break;
                }
            }
            else
            {
                // for weapon handover quests, remove the item and its children.
                const toRemove = InventoryHelper.findAndReturnChildren(pmcData, itemHandover.id);
                let index = pmcData.Inventory.items.length;

                // important: don't tell the client to remove the attachments, it will handle it
                output.profileChanges[sessionID].items.del.push({ "_id": itemHandover.id });

                // important: loop backward when removing items from the array we're looping on
                while (index-- > 0)
                {
                    if (toRemove.includes(pmcData.Inventory.items[index]._id))
                    {
                        pmcData.Inventory.items.splice(index, 1);
                    }
                }
            }
        }

        if (pmcData.BackendCounters[body.conditionId] !== undefined)
        {
            pmcData.BackendCounters[body.conditionId].value += counter;
        }
        else
        {
            pmcData.BackendCounters[body.conditionId] = { "id": body.conditionId, "qid": body.qid, "value": counter };
        }

        return output;
    }

    static acceptedUnlocked(acceptedQuestId, sessionID)
    {
        const profile = ProfileController.getPmcProfile(sessionID);
        let quests = QuestController.questValues().filter((q) =>
        {
            const acceptedQuestCondition = q.conditions.AvailableForStart.find(
                c =>
                {
                    return c._parent === "Quest" && c._props.target === acceptedQuestId && c._props.status[0] === QuestHelper.status.Started;
                });

            if (!acceptedQuestCondition)
            {
                return false;
            }

            const profileQuest = profile.Quests.find(pq => pq.qid === acceptedQuestId);
            return profileQuest && (profileQuest.status === "Started" || profileQuest.status === "AvailableForFinish");
        });

        return QuestController.cleanQuestList(quests);
    }

    static failedUnlocked(failedQuestId, sessionID)
    {
        const profile = ProfileController.getPmcProfile(sessionID);
        let quests = QuestController.questValues().filter((q) =>
        {
            const acceptedQuestCondition = q.conditions.AvailableForStart.find(
                c =>
                {
                    return c._parent === "Quest" && c._props.target === failedQuestId && c._props.status[0] === QuestHelper.status.Fail;
                });

            if (!acceptedQuestCondition)
            {
                return false;
            }

            const profileQuest = profile.Quests.find(pq => pq.qid === failedQuestId);
            return profileQuest && (profileQuest.status === "Fail");
        });

        return QuestController.cleanQuestList(quests);
    }

    static applyMoneyBoost(quest, moneyBoost)
    {
        for (let reward of quest.rewards.Success)
        {
            if (reward.type === "Item")
            {
                if (PaymentController.isMoneyTpl(reward.items[0]._tpl))
                {
                    reward.items[0].upd.StackObjectsCount += Math.round(reward.items[0].upd.StackObjectsCount * moneyBoost / 100);
                }
            }
        }

        return quest;
    }

    /* Sets the item stack to value, or delete the item if value <= 0 */
    // TODO maybe merge this function and the one from customization
    static changeItemStack(pmcData, id, value, sessionID, output)
    {
        const inventoryItemIndex = pmcData.Inventory.items.findIndex(item => item._id === id);
        if (inventoryItemIndex < 0)
        {
            Logger.error(`changeItemStack: Item with _id = ${id} not found in inventory`);
            return;
        }

        if (value > 0)
        {
            const item = pmcData.Inventory.items[inventoryItemIndex];
            item.upd.StackObjectsCount = value;

            output.profileChanges[sessionID].items.change.push({
                "_id": item._id,
                "_tpl": item._tpl,
                "parentId": item.parentId,
                "slotId": item.slotId,
                "location": item.location,
                "upd": { "StackObjectsCount": item.upd.StackObjectsCount }
            });
        }
        else
        {
            // this case is probably dead Code right now, since the only calling function
            // checks explicitely for Value > 0.
            output.profileChanges[sessionID].items.del.push({ "_id": id });
            pmcData.Inventory.items.splice(inventoryItemIndex, 1);
        }
    }

    /**
     * Get List of All Quests as an array
     */
    static questValues()
    {
        return Object.values(DatabaseServer.tables.templates.quests);
    }

    /*
    * Quest status values
    * 0 - Locked
    * 1 - AvailableForStart
    * 2 - Started
    * 3 - AvailableForFinish
    * 4 - Success
    * 5 - Fail
    * 6 - FailRestartable
    * 7 - MarkedAsFailed
    */
    static questStatus(pmcData, questID)
    {
        for (let quest of pmcData.Quests)
        {
            if (quest.qid === questID)
            {
                return quest.status;
            }
        }

        return "Locked";
    }

    static cleanQuestList(quests)
    {
        for (const i in quests)
        {
            quests[i] = QuestController.cleanQuestConditions(quests[i]);
        }

        return quests;
    }

    static cleanQuestConditions(quest)
    {
        quest = JsonUtil.clone(quest);
        quest.conditions.AvailableForStart = quest.conditions.AvailableForStart.filter(q => q._parent === "Level");
        return quest;
    }

    static resetProfileQuestCondition(sessionID, conditionId)
    {
        let startedQuests = ProfileController.getPmcProfile(sessionID).Quests.filter(q => q.status === "Started");

        for (let quest of startedQuests)
        {
            const index = quest.completedConditions.indexOf(conditionId);

            if (index > -1)
            {
                quest.completedConditions.splice(index, 1);
            }
        }
    }
}

module.exports = QuestController;
