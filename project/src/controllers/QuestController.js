//@ts-check
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

const DatabaseServer = require("../servers/DatabaseServer");
const ItemEventRouter = require("../routers/ItemEventRouter");
const QuestConfig = require("../configs/QuestConfig.json");
const TimeUtil = require("../utils/TimeUtil");
const ItemHelper = require("../helpers/ItemHelper");
const Helpers = require("../helpers/PlzRefactorMeHelper");
const JsonUtil = require("../utils/JsonUtil");

class QuestController
{
    getClientQuests(sessionID)
    {
        /** @type {Quest[]} */
        let quests = [];
        /** @type {Quest[]} */
        let allQuests = this.questValues();
        /** @type {UserPMCProfile} */
        const profile = profile_f.controller.getPmcProfile(sessionID);

        for (let quest of allQuests)
        {
            // If a quest is already in the profile we need to just add it
            /**
             * @param {{ qid: string; }} pq
             */
            if (profile.Quests.includes(pq => pq.qid === quest._id))
            {
                quests.push(quest);
                continue;
            }

            // Don't add quests that have a level higher than the user's
            /** @type {QuestAvailableForStartConditions[]} */
            const levels = quest_f.helpers.getLevelConditions(quest.conditions.AvailableForStart);
            if (levels.length)
            {
                if (!quest_f.helpers.evaluateLevel(profile, levels[0]))
                {
                    continue;
                }
            }
            /** @type {QuestAvailableForStartConditions[]} */
            const conditions = quest_f.helpers.getQuestConditions(quest.conditions.AvailableForStart);
            // If the quest has no quest conditions then add to visible quest list
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
                /** @type {PlayerQuest | undefined} */
                const previousQuest = profile.Quests.find(pq => pq.qid === condition._props.target);

                // If the previous quest isn't in the user profile, it hasn't been completed or started
                if (!previousQuest)
                {
                    canSend = false;
                    break;
                }

                // If previous is in user profile, check condition requirement and current status
                if (previousQuest.status === Object.keys(quest_f.helpers.status)[condition._props.status[0]])
                {
                    continue;
                }

                // Chemical fix: "Started" Status is catered for above. This will include it just if it's started.
                if ((condition._props.status[0] === quest_f.helpers.status.Started)
                // but maybe this is better:
                // && (previousQuest.status === "AvailableForFinish" || previousQuest.status ===  "Success")
                )
                {
                    let statusName = Object.keys(quest_f.helpers.status)[condition._props.status[0]];
                    Logger.debug(`[QUESTS]: fix for polikhim bug: ${quest._id} (${quest_f.helpers.getQuestLocale(quest._id).name}) ${condition._props.status[0]}, ${statusName} != ${previousQuest.status}`);
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

    /**
     * @param {string} itemTpl
     */
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

    /**
     * @param {QuestReward} reward
     * @return {itemTemplate[]}
     */
    processReward(reward)
    {
        /** @type {itemTemplate[]} */
        let rewardItems = [];
        /** @type {itemTemplate[]} */
        let targets = [];
        /** @type {itemTemplate[]} */
        let mods = [];

        let itemCount = 1;

        // separate base item and mods, fix stacks

        for (let item of reward.items)
        {
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
            /** @type {itemTemplate[]} */
            let items = [target];

            for (const mod of mods)
            {
                items.push(JsonUtil.clone(mod));
            }

            for (let i = 0; i < itemCount; i++)
                rewardItems = rewardItems.concat(Helpers.replaceIDs(null, items));
        }

        return rewardItems;
    }

    /* Gets a flat list of reward items for the given quest and state
    * input: quest, a quest object
    * input: state, the quest status that holds the items (Started, Success, Fail)
    * output: an array of items with the correct maxStack
    */
    /**
     * @param {{ rewards: { [x: string]: any; }; }} quest
     * @param {string} state
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

    /**
     * @param {UserPMCProfile} pmcData
     * @param {QuestRequestBody} body
     * @param {"Started" | "Fail" | "AvailableForFinish" | "Success"} state
     * @param {string} sessionID
     */
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
        let quest = DatabaseServer.tables.templates.quests[body.qid];

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

    /**
     * @param {UserPMCProfile} pmcData
     * @param {QuestRequestBody} body
     * @param {string} sessionID
     */
    acceptQuest(pmcData, body, sessionID)
    {
        let /**
             * @param {{ qid: any; }} q
             */
            quest = pmcData.Quests.find((q) =>
            {
                return q.qid === body.qid;
            });
        const time = TimeUtil.getTimestamp();
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
                "status": state,
                "completedConditions": []
            });
        }

        // Create a dialog message for starting the quest.
        // Note that for starting quests, the correct locale field is "description", not "startedMessageText".
        let questDb = DatabaseServer.tables.templates.quests[body.qid];
        let questLocale = DatabaseServer.tables.locales.global["en"].quest[body.qid];
        let questRewards = this.getQuestRewardItems(questDb, state);
        let messageContent = {
            "templateId": questLocale.startedMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questStart"),
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        if (questLocale.startedMessageText === "" || questLocale.startedMessageText.length === 24)
        {
            messageContent = {
                "templateId": questLocale.description,
                "type": dialogue_f.controller.getMessageTypeValue("questStart"),
                "maxStorageTime": QuestConfig.redeemTime * 3600
            };
        }

        dialogue_f.controller.addDialogueMessage(questDb.traderId, messageContent, sessionID, questRewards);

        let acceptQuestResponse = ItemEventRouter.getOutput();
        /** @type {Quest[]} */
        acceptQuestResponse.quests = this.acceptedUnlocked(body.qid, sessionID);

        return acceptQuestResponse;
    }

    /**
     * @param {UserPMCProfile} pmcData
     * @param {{ qid: string; }} body
     * @param {string} sessionID
     */
    completeQuest(pmcData, body, sessionID)
    {
        const beforeQuests = this.getClientQuests(sessionID);
        let questRewards = this.applyQuestReward(pmcData, body, "Success", sessionID);

        //Check if any of linked quest is failed, and that is unrestartable.
        const checkQuest = this.questValues().filter((q) =>
        {
            return q.conditions.Fail.length > 0 && q.conditions.Fail[0]._props.target === body.qid;
        });

        for (const checkFail of checkQuest)
        {
            if (checkFail.conditions.Fail[0]._props.status[0] === quest_f.helpers.status.Success)
            {
                const /**
                     * @param {{ qid: string; }} qq
                     */
                    checkQuestId = pmcData.Quests.find(qq => qq.qid === checkFail._id);
                if (checkQuestId)
                {
                    const failBody = { "Action": "QuestComplete", "qid": checkFail._id, "removeExcessItems": true };
                    this.failQuest(pmcData, failBody, sessionID);
                }
                else
                {
                    /** @type {PlayerQuest} */
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
        /** @type {Quest} */
        let quest = DatabaseServer.tables.templates.quests[body.qid];
        const questLocale = DatabaseServer.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.successMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questSuccess"),
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        let completeQuestResponse = ItemEventRouter.getOutput();
        completeQuestResponse.quests = quest_f.helpers.getDeltaQuests(beforeQuests, this.getClientQuests(sessionID));
        quest_f.helpers.dumpQuests(completeQuestResponse.quests);
        return completeQuestResponse;
    }

    /**
     * @param {any} pmcData
     * @param {{ Action?: string; qid: any; removeExcessItems?: boolean; }} body
     * @param {any} sessionID
     */
    failQuest(pmcData, body, sessionID)
    {
        let questRewards = this.applyQuestReward(pmcData, body, "Fail", sessionID);

        // Create a dialog message for completing the quest.
        const quest = DatabaseServer.tables.templates.quests[body.qid];
        const questLocale = DatabaseServer.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.failMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questFail"),
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        let failedQuestResponse = ItemEventRouter.getOutput();
        failedQuestResponse.quests = this.failedUnlocked(body.qid, sessionID);

        return failedQuestResponse;
    }

    /**
     * @param {UserPMCProfile} pmcData
     * @param {{ qid: string; conditionId: string; items: any; }} body
     * @param {string} sessionID
     */
    handoverQuest(pmcData, body, sessionID)
    {
        const quest = DatabaseServer.tables.templates.quests[body.qid];
        const types = ["HandoverItem", "WeaponAssembly"];
        let output = ItemEventRouter.getOutput();
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
            Logger.error("Quest handover error: condition not found or incorrect value. qid=" + body.qid + ", condition=" + body.conditionId);
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
                const toRemove = InventoryHelper.findAndReturnChildren(pmcData, itemHandover.id);
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

    /**
     * @param {string} acceptedQuestId
     * @param {string} sessionID
     */
    acceptedUnlocked(acceptedQuestId, sessionID)
    {
        const profile = profile_f.controller.getPmcProfile(sessionID);
        let quests = this.questValues().filter((q) =>
        {
            const acceptedQuestCondition = q.conditions.AvailableForStart.find(
                c =>
                {
                    return c._parent === "Quest" && c._props.target === acceptedQuestId && c._props.status[0] === quest_f.helpers.status.Started;
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



    /**
     * @param {string} failedQuestId
     * @param {string} sessionID
     */
    failedUnlocked(failedQuestId, sessionID)
    {
        const profile = profile_f.controller.getPmcProfile(sessionID);
        let quests = this.questValues().filter((q) =>
        {
            const acceptedQuestCondition = q.conditions.AvailableForStart.find(
                c =>
                {
                    return c._parent === "Quest" && c._props.target === failedQuestId && c._props.status[0] === quest_f.helpers.status.Fail;
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

    /**
     * @param {Quest} quest
     * @param {number} moneyBoost
     */
    applyMoneyBoost(quest, moneyBoost)
    {
        for (let reward of quest.rewards.Success)
        {
            if (reward.type === "Item")
            {
                if (Helpers.isMoneyTpl(reward.items[0]._tpl))
                {
                    reward.items[0].upd.StackObjectsCount += Math.round(reward.items[0].upd.StackObjectsCount * moneyBoost / 100);
                }
            }
        }

        return quest;
    }

    /* Sets the item stack to value, or delete the item if value <= 0 */
    // TODO maybe merge this function and the one from customization
    /**
     * @param {UserPMCProfile} pmcData
     * @param {string} id
     * @param {number} value
     * @param {apiEventResponse} output
     */
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

    /**
     * Get List of All Quests as an array
     *
     * @return {Quest[]}
     * @memberof quest_f.Controller
     */
    questValues()
    {
        /** @type {Quest[]} */
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
    /**
     * @param {UserPMCProfile} pmcData
     * @param {string} questID
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

    /**
     * @param {Quest[]} quests
     */
    cleanQuestList(quests)
    {
        for (const i in quests)
        {
            quests[i] = this.cleanQuestConditions(quests[i]);
        }

        return quests;
    }

    /**
     * @param {Quest} quest
     */
    cleanQuestConditions(quest)
    {
        quest = JsonUtil.clone(quest);
        /**
         * @param {{ _parent: string; }} q
         */
        quest.conditions.AvailableForStart = quest.conditions.AvailableForStart.filter(q => q._parent === "Level");
        return quest;
    }

    /**
     * @param {string} sessionID
     * @param {string} conditionId
     */
    resetProfileQuestCondition(sessionID, conditionId)
    {
        let startedQuests = profile_f.controller.getPmcProfile(sessionID).Quests.filter(q => q.status === "Started");

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

module.exports = new QuestController();
