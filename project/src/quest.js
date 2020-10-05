/* quest.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Emperor06
 */

"use strict";

class Controller
{
    getCachedQuest(qid)
    {
        for (let quest of database_f.database.tables.templates.quests)
        {
            if (quest._id === qid)
            {
                return quest;
            }
        }

        return null;
    }

    processReward(reward)
    {
        let rewardItems = [];
        let targets;
        let mods = [];

        // separate base item and mods, fix stacks
        for (let item of reward.items)
        {
            if (item._id === reward.target)
            {
                targets = helpfunc_f.helpFunctions.splitStack(item);
            }
            else
            {
                mods.push(item);
            }
        }

        // add mods to the base items, fix ids
        for (let target of targets)
        {
            let items = [target];

            for (let mod of mods)
            {
                items.push(helpfunc_f.helpFunctions.clone(mod));
            }

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

        for (let reward of quest.rewards[state])
        {
            if ("Item" === reward.type)
            {
                questRewards = questRewards.concat(this.processReward(reward));
            }
        }

        return questRewards;
    }

    acceptQuest(pmcData, body, sessionID)
    {
        let state = "Started";
        let found = false;

        // If the quest already exists, update its status
        for (const quest of pmcData.Quests)
        {
            if (quest.qid === body.qid)
            {
                quest.startTime = utility.getTimestamp();
                quest.status = state;
                found = true;
                break;
            }
        }

        // Otherwise, add it
        if (!found)
        {
            pmcData.Quests.push({
                "qid": body.qid,
                "startTime": utility.getTimestamp(),
                "status": state
            });
        }

        // Create a dialog message for starting the quest.
        // Note that for starting quests, the correct locale field is "description", not "startedMessageText".
        let quest = this.getCachedQuest(body.qid);
        let questLocale = database_f.database.tables.locales.global["en"].quest[body.qid];
        let questRewards = this.getQuestRewardItems(quest, state);
        let messageContent = {
            "templateId": questLocale.startedMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questStart"),
            "maxStorageTime": quest_f.config.redeemTime * 3600

        };

        if (questLocale.startedMessageText === "")
        {
            messageContent = {
                "templateId": questLocale.description,
                "type": dialogue_f.controller.getMessageTypeValue("questStart"),
                "maxStorageTime": quest_f.config.redeemTime * 3600
            };
        }

        dialogue_f.controller.addDialogueMessage(quest.traderId, messageContent, sessionID, questRewards);

        return item_f.router.getOutput();
    }

    completeQuest(pmcData, body, sessionID)
    {
        let state = "Success";
        let intelCenterBonus = 0;//percentage of money reward

        //find if player has money reward boost
        for (let area of pmcData.Hideout.Areas)
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

        for (let quest in pmcData.Quests)
        {
            if (pmcData.Quests[quest].qid === body.qid)
            {
                pmcData.Quests[quest].status = state;
                break;
            }
        }

        //Check if any of linked quest is failed, and that is unrestartable.
        for (const quest of pmcData.Quests)
        {
            if (!(quest.status === "Locked" || quest.status === "AvailableForStart" || quest.status === "Success" || quest.status === "Fail"))
            {
                let checkFail = this.getCachedQuest(quest.qid);
                for (let failCondition of checkFail.conditions.Fail)
                {
                    if (checkFail.restartable === false && failCondition._parent === "Quest" && failCondition._props.target === body.qid)
                    {
                        quest.status = "Fail";
                    }
                }
            }
        }

        // give reward
        let quest = this.getCachedQuest(body.qid);

        if (intelCenterBonus > 0)
        {
            quest = this.applyMoneyBoost(quest, intelCenterBonus);    //money = money + (money*intelCenterBonus/100)
        }

        let questRewards = this.getQuestRewardItems(quest, state);

        for (let reward of quest.rewards.Success)
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

        // Create a dialog message for completing the quest.
        let questDb = this.getCachedQuest(body.qid);
        let questLocale = database_f.database.tables.locales.global["en"].quest[body.qid];
        let messageContent = {
            "templateId": questLocale.successMessageText,
            "type": dialogue_f.controller.getMessageTypeValue("questSuccess"),
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage(questDb.traderId, messageContent, sessionID, questRewards);
        return item_f.router.getOutput();
    }

    handoverQuest(pmcData, body, sessionID)
    {
        const quest = this.getCachedQuest(body.qid);
        let output = item_f.router.getOutput();
        let types = ["HandoverItem", "WeaponAssembly"];
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
            logger.logError("Quest handover error: condition not found or incorrect value. qid=" + body.qid + ", condition=" + body.conditionId);
            return output;
        }

        for (let itemHandover of body.items)
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
                let toRemove = helpfunc_f.helpFunctions.findAndReturnChildren(pmcData, itemHandover.id);
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
            pmcData.BackendCounters[body.conditionId] = {"id": body.conditionId, "qid": body.qid, "value": counter};
        }

        return output;
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
    getQuestStatus(pmcData, questID)
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
}

class Callbacks
{
    constructor()
    {
        item_f.router.addRoute("QuestAccept", this.acceptQuest.bind());
        item_f.router.addRoute("QuestComplete", this.completeQuest.bind());
        item_f.router.addRoute("QuestHandover", this.handoverQuest.bind());
    }

    acceptQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.acceptQuest(pmcData, body, sessionID);
    }

    completeQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.completeQuest(pmcData, body, sessionID);
    }

    handoverQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.handoverQuest(pmcData, body, sessionID);
    }
}

class Config
{
    constructor()
    {
        this.RedeemTime = 48;
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
