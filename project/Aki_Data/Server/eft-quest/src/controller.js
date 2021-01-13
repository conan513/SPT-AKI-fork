/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Emperor06
 * - Ginja
 * - Ereshkigal
 */

"use strict";

class Controller
{
    constructor()
    {
        this.status = {
            Locked: 0,
            AvailableForStart: 1,
            Started: 2,
            AvailableForFinish: 3,
            Success: 4,
            Fail: 5,
            FailRestartable: 6,
            MarkedAsFailed: 7
        };
    }
    getClientQuests(url, info, sessionID)
    {
        let quests = [];
        const profile = profile_f.controller.getPmcProfile(sessionID);

        for (let quest of this.questValues())
        {
            const conditions = quest.conditions.AvailableForStart.filter(
                c =>
                {
                    return c._parent === "Quest";
                });


            // If the quest has no quest conditions then add to visible quest list
            // If a quest is already in the profile we don't need to check it again
            if (conditions.length === 0 || profile.Quests.includes(pq => pq.qid === quest._id))
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
                if ((condition._props.status[0] === this.status.Success && previousQuest.status === "Success")
                    || (condition._props.status[0] === 2 && previousQuest.status === "Started")
                    || (condition._props.status[0] === 5 && previousQuest.status === "Fail"))
                {
                    continue;
                }

                // Chemical fix
                if ((condition._props.status[0] === this.status.Started)
                )
                {
                    common_f.logger.logDebug(`[QUESTS]: polikhim bug criteria hit: ${quest._id} (${this.getQuestLocale(quest._id).name})`);
                    if (quest._id !== "5979f8bb86f7743ec214c7a6")
                    {
                        common_f.logger.logDebug("[QUESTS]: Not polikhim. Please report");
                        console.log(quest);
                    }

                    continue;
                }
                canSend = false;
                break;
            }

            if (canSend)
            {
                quests.push(this.cleanQuestConditions(quest));
            }
        }

        return quests;
    }

    getFindItemIdForQuestItem(itemTpl)
    {
        for (const quest of this.questValues())
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

    processReward(reward)
    {
        let rewardItems = [];
        let targets;
        let mods = [];

        let itemCount = 1;

        // separate base item and mods, fix stacks
        for (let item of reward.items)
        {
            if (item._id === reward.target)
            {
                if (("parentId" in item) && (item.parentId === "hideout") && ("upd" in item) && ("StackObjectsCount" in item.upd) && (item.upd.StackObjectsCount > 1))
                {
                    itemCount = item.upd.StackObjectsCount;
                    item.upd.StackObjectsCount = 1;
                }
                targets = helpfunc_f.helpFunctions.splitStack(item);
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
                items.push(common_f.json.clone(mod));
            }

            for (let i = 0; i < itemCount; i++)
                rewardItems = rewardItems.concat(helpfunc_f.helpFunctions.replaceIDs(null, items));
        }

        return rewardItems;
    }

    /* Gets a flat list of reward items for the given quest and state
    * input: quest, a quest object
    * input: state, the quest status that holds the items (Started, Success, Fail)
    * output: an array of items with the correct maxStack
    */
    getQuestRewardItems(quest, state)
    {
        let questRewards = [];

        for (const reward of quest.rewards[state])
        {
            if ("Item" === reward.type)
            {
                questRewards = questRewards.concat(this.processReward(reward));
            }
        }

        return questRewards;
    }

    applyQuestReward(pmcData, body, state, sessionID)
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
        let quest = database_f.server.tables.templates.quests[body.qid];

        if (intelCenterBonus > 0)
        {
            quest = this.applyMoneyBoost(quest, intelCenterBonus);    //money = money + (money*intelCenterBonus/100)
        }

        for (const reward of quest.rewards[state])
        {
            switch (reward.type)
            {
                case "Skill":
                    pmcData = profile_f.controller.getPmcProfile(sessionID);

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
                    pmcData = profile_f.controller.getPmcProfile(sessionID);
                    pmcData.Info.Experience += parseInt(reward.value);
                    break;

                case "TraderStanding":
                    pmcData = profile_f.controller.getPmcProfile(sessionID);
                    pmcData.TraderStandings[reward.target].currentStanding += parseFloat(reward.value);

                    if (pmcData.TraderStandings[reward.target].currentStanding < 0)
                    {
                        pmcData.TraderStandings[reward.target].currentStanding = 0;
                    }

                    trader_f.controller.lvlUp(reward.target, sessionID);
                    break;

                case "TraderUnlock":
                    trader_f.controller.changeTraderDisplay(reward.target, true, sessionID);
                    break;
            }
        }

        return this.getQuestRewardItems(quest, state);
    }

    acceptQuest(pmcData, body, sessionID)
    {
        let quest = pmcData.Quests.find((q) =>
        {
            return q.qid === body.qid;
        });
        const time = common_f.time.getTimestamp();
        const state = "Started";

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
                "status": state
            });
        }

        // Create a dialog message for starting the quest.
        // Note that for starting quests, the correct locale field is "description", not "startedMessageText".
        let questDb = database_f.server.tables.templates.quests[body.qid];
        let questLocale = database_f.server.tables.locales.global["en"].quest[body.qid];
        let questRewards = this.getQuestRewardItems(questDb, state);
        let messageContent = {
            "templateId": questLocale.startedMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questStart"),
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        if (questLocale.startedMessageText === "" || questLocale.startedMessageText.length === 24)
        {
            messageContent = {
                "templateId": questLocale.description,
                "type": dialogue_f.controller.getMessageTypeValue("questStart"),
                "maxStorageTime": quest_f.config.redeemTime * 3600
            };
        }

        dialogue_f.controller.addDialogueMessage(questDb.traderId, messageContent, sessionID, questRewards);

        let acceptQuestResponse = item_f.eventHandler.getOutput();
        acceptQuestResponse.quests = this.acceptedUnlocked(body.qid, sessionID);

        return acceptQuestResponse;
    }

    getQuestLocale(questId)
    {
        const questLocale = database_f.server.tables.locales.global["en"].quest[questId];
        return questLocale;
    }

    completeQuest(pmcData, body, sessionID)
    {
        let questRewards = this.applyQuestReward(pmcData, body, "Success", sessionID);

        //Check if any of linked quest is failed, and that is unrestartable.
        const checkQuest = this.questValues().filter((q) =>
        {
            return q.conditions.Fail.length > 0 && q.conditions.Fail[0]._props.target === body.qid;
        });

        for (const checkFail of checkQuest)
        {
            if (checkFail.conditions.Fail[0]._props.status[0] === this.status.Success)
            {
                const checkQuestId = pmcData.Quests.find(qq => qq.qid === checkFail._id);
                if (checkQuestId)
                {
                    const failBody = { "Action": "QuestComplete", "qid": checkFail._id, "removeExcessItems": true };
                    this.failQuest(pmcData, failBody, sessionID);
                }
                else
                {
                    const questData = {
                        "qid": checkFail._id,
                        "startTime": common_f.time.getTimestamp(),
                        "status": "Fail"
                    };
                    pmcData.Quests.push(questData);
                }
            }
        }

        // Create a dialog message for completing the quest.
        let quest = database_f.server.tables.templates.quests[body.qid];
        const questLocale = database_f.server.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.successMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questSuccess"),
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        let completeQuestResponse = item_f.eventHandler.getOutput();
        completeQuestResponse.quests = this.completedUnlocked(body.qid, sessionID);
        for (const quest of completeQuestResponse.quests)
        {
            common_f.logger.logDebug(`[QUESTS]: return: ${quest._id} (${this.getQuestLocale(quest._id).name}) : ${quest.conditions.AvailableForStart.length}`);
        }
        return completeQuestResponse;
    }

    failQuest(pmcData, body, sessionID)
    {
        let questRewards = this.applyQuestReward(pmcData, body, "Fail", sessionID);

        // Create a dialog message for completing the quest.
        const quest = database_f.server.tables.templates.quests[body.qid];
        const questLocale = database_f.server.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.failMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questFail"),
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        let failedQuestResponse = item_f.eventHandler.getOutput();
        failedQuestResponse.quests = this.failedUnlocked(body.qid, sessionID);

        return failedQuestResponse;
    }

    handoverQuest(pmcData, body, sessionID)
    {
        const quest = database_f.server.tables.templates.quests[body.qid];
        const types = ["HandoverItem", "WeaponAssembly"];
        let output = item_f.eventHandler.getOutput();
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
            common_f.logger.logError("Quest handover error: condition not found or incorrect value. qid=" + body.qid + ", condition=" + body.conditionId);
            return output;
        }

        for (const itemHandover of body.items)
        {
            // remove the right quantity of given items
            amount = Math.min(itemHandover.count, value - counter);
            counter += amount;
            if (itemHandover.count - amount > 0)
            {
                this.changeItemStack(pmcData, itemHandover.id, itemHandover.count - amount, output);

                if (counter === value)
                {
                    break;
                }
            }
            else
            {
                // for weapon handover quests, remove the item and its children.
                const toRemove = helpfunc_f.helpFunctions.findAndReturnChildren(pmcData, itemHandover.id);
                let index = pmcData.Inventory.items.length;

                // important: don't tell the client to remove the attachments, it will handle it
                output.items.del.push({ "_id": itemHandover.id });

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

        if (body.conditionId in pmcData.BackendCounters)
        {
            pmcData.BackendCounters[body.conditionId].value += counter;
        }
        else
        {
            pmcData.BackendCounters[body.conditionId] = { "id": body.conditionId, "qid": body.qid, "value": counter };
        }

        return output;
    }

    acceptedUnlocked(acceptedQuestId, sessionID)
    {
        const profile = profile_f.controller.getPmcProfile(sessionID);
        let quests = this.questValues().filter((q) =>
        {
            const acceptedQuestCondition = q.conditions.AvailableForStart.find(
                c =>
                {
                    return c._parent === "Quest" && c._props.target === acceptedQuestId && c._props.status[0] === 2;
                });

            if (!acceptedQuestCondition)
            {
                return false;
            }

            const profileQuest = profile.Quests.find(pq => pq.qid === acceptedQuestId);
            return profileQuest && (profileQuest.status === "Started" || profileQuest.status === "AvailableForFinish");
        });

        return this.cleanQuestList(quests);
    }

    filterQuestsConditions(q, furtherFilter = null)
    {

        const filteredQuests = q.filter(
            c =>
            {
                if (c._parent === "Quest" && c._props.status[0] === this.status.Success)
                {
                    if (furtherFilter)
                    {
                        return furtherFilter(c);
                    }
                    return true;
                }
                return false;
            });
        return filteredQuests;
    }

    completedUnlocked(completedQuestId, sessionID)
    {
        const profile = profile_f.controller.getPmcProfile(sessionID);
        let quests = this.questValues().filter((q) =>
        {
            const completedQuestCondition = this.filterQuestsConditions(q.conditions.AvailableForStart, (c) =>
            {
                return c._props.target === completedQuestId;
            });

            if (!completedQuestCondition)
            {
                return false;
            }

            const otherQuestConditions = q.conditions.AvailableForStart.filter(
                c =>
                {
                    return c._parent === "Quest" && c._props.target !== completedQuestId && c._props.status[0] === this.status.Success;
                });

            for (const condition of otherQuestConditions)
            {
                const profileQuest = profile.Quests.find(pq => pq.qid === condition._props.target);

                if (!profileQuest || profileQuest.status !== "Success")
                {
                    return false;
                }
            }

            return true;
        });

        return this.cleanQuestList(quests);
    }

    failedUnlocked(failedQuestId, sessionID)
    {
        const profile = profile_f.controller.getPmcProfile(sessionID);
        let quests = this.questValues().filter((q) =>
        {
            const acceptedQuestCondition = q.conditions.AvailableForStart.find(
                c =>
                {
                    return c._parent === "Quest" && c._props.target === failedQuestId && c._props.status[0] === this.status.Fail;
                });

            if (!acceptedQuestCondition)
            {
                return false;
            }

            const profileQuest = profile.Quests.find(pq => pq.qid === failedQuestId);
            return profileQuest && (profileQuest.status === "Fail");
        });

        return this.cleanQuestList(quests);
    }

    applyMoneyBoost(quest, moneyBoost)
    {
        for (let reward of quest.rewards.Success)
        {
            if (reward.type === "Item")
            {
                if (helpfunc_f.helpFunctions.isMoneyTpl(reward.items[0]._tpl))
                {
                    reward.items[0].upd.StackObjectsCount += Math.round(reward.items[0].upd.StackObjectsCount * moneyBoost / 100);
                }
            }
        }

        return quest;
    }

    /* Sets the item stack to value, or delete the item if value <= 0 */
    // TODO maybe merge this function and the one from customization
    changeItemStack(pmcData, id, value, output)
    {
        for (let inventoryItem in pmcData.Inventory.items)
        {
            if (pmcData.Inventory.items[inventoryItem]._id === id)
            {
                if (value > 0)
                {
                    let item = pmcData.Inventory.items[inventoryItem];

                    item.upd.StackObjectsCount = value;

                    output.items.change.push({
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
                    output.items.del.push({ "_id": id });
                    pmcData.Inventory.items.splice(inventoryItem, 1);
                }

                break;
            }
        }
    }

    questValues()
    {
        return Object.values(database_f.server.tables.templates.quests);
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
    questStatus(pmcData, questID)
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

    cleanQuestList(quests)
    {
        for (const i in quests)
        {
            quests[i] = this.cleanQuestConditions(quests[i]);
        }

        return quests;
    }

    cleanQuestConditions(quest)
    {
        quest = common_f.json.clone(quest);
        quest.conditions.AvailableForStart = quest.conditions.AvailableForStart.filter(q => q._parent === "Level");
        return quest;
    }
}

module.exports.Controller = Controller;
