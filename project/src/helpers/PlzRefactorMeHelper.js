"use strict";

require("../Lib.js");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// PLEASE REFACTOR THIS //////////////////////////////////////////////
//////////////////////////////////// THIS CODE SHOULD BE STORED SOMEWHERE ELSE ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class PlzRefactorMeHelper
{
    static calculateLevel(pmcData)
    {
        let exp = 0;

        for (let level in DatabaseServer.tables.globals.config.exp.level.exp_table)
        {
            if (pmcData.Info.Experience < exp)
            {
                break;
            }

            pmcData.Info.Level = parseInt(level);
            exp += DatabaseServer.tables.globals.config.exp.level.exp_table[level].exp;
        }

        return pmcData.Info.Level;
    }

    static getRandomExperience()
    {
        let exp = 0;
        let expTable = DatabaseServer.tables.globals.config.exp.level.exp_table;

        // Get random level based on the exp table.
        let randomLevel = RandomUtil.getInt(0, expTable.length - 1) + 1;

        for (let i = 0; i < randomLevel; i++)
        {
            exp += expTable[i].exp;
        }

        // Sprinkle in some random exp within the level, unless we are at max level.
        if (randomLevel < expTable.length - 1)
        {
            exp += RandomUtil.getInt(0, expTable[randomLevel].exp - 1);
        }

        return exp;
    }

    /* Made a 2d array table with 0 - free slot and 1 - used slot
    * input: PlayerData
    * output: table[y][x]
    * */
    static getPlayerStashSlotMap(pmcData, sessionID)
    {
        const PlayerStashSize = InventoryHelper.getPlayerStashSize(sessionID);
        return ContainerHelper.getContainerMap(PlayerStashSize[0], PlayerStashSize[1], pmcData.Inventory.items, pmcData.Inventory.stash);
    }

    /**
     * Find Barter items in the inventory
     */
    static findBarterItems(by, pmcData, barter_itemID)
    { // find required items to take after buying (handles multiple items)
        const barterIDs = typeof barter_itemID === "string" ? [barter_itemID] : barter_itemID;
        let itemsArray = [];

        for (const barterID of barterIDs)
        {
            let mapResult = pmcData.Inventory.items.filter(item =>
            {
                return by === "tpl" ? (item._tpl === barterID) : (item._id === barterID);
            });

            itemsArray = Object.assign(itemsArray, mapResult);
        }

        return itemsArray;
    }

    static replaceIDs(pmcData, items, fastPanel = null)
    {
        // replace bsg shit long ID with proper one
        let string_inventory = JsonUtil.serialize(items);

        for (let item of items)
        {
            let insuredItem = false;

            if (pmcData !== null)
            {
                // insured items shouldn't be renamed
                // only works for pmcs.
                for (let insurance of pmcData.InsuredItems)
                {
                    if (insurance.itemId === item._id)
                    {
                        insuredItem = true;
                    }
                }

                // do not replace important ID's
                if (item._id === pmcData.Inventory.equipment
                    || item._id === pmcData.Inventory.questRaidItems
                    || item._id === pmcData.Inventory.questStashItems
                    || insuredItem)
                {
                    continue;
                }
            }

            // replace id
            let old_id = item._id;
            let new_id = HashUtil.generate();

            string_inventory = string_inventory.replace(new RegExp(old_id, "g"), new_id);
            // Also replace in quick slot if the old ID exists.
            if (fastPanel !== null)
            {
                for (let itemSlot in fastPanel)
                {
                    if (fastPanel[itemSlot] === old_id)
                    {
                        fastPanel[itemSlot] = fastPanel[itemSlot].replace(new RegExp(old_id, "g"), new_id);
                    }
                }
            }
        }

        items = JsonUtil.deserialize(string_inventory);

        // fix duplicate id's
        let dupes = {};
        let newParents = {};
        let childrenMapping = {};
        let oldToNewIds = {};

        // Finding duplicate IDs involves scanning the item three times.
        // First scan - Check which ids are duplicated.
        // Second scan - Map parents to items.
        // Third scan - Resolve IDs.
        for (let item of items)
        {
            dupes[item._id] = (dupes[item._id] || 0) + 1;
        }

        for (let item of items)
        {
            // register the parents
            if (dupes[item._id] > 1)
            {
                let newId = HashUtil.generate();

                newParents[item.parentId] = newParents[item.parentId] || [];
                newParents[item.parentId].push(item);
                oldToNewIds[item._id] = oldToNewIds[item._id] || [];
                oldToNewIds[item._id].push(newId);
            }
        }

        for (let item of items)
        {
            if (dupes[item._id] > 1)
            {
                let oldId = item._id;
                let newId = oldToNewIds[oldId].splice(0, 1)[0];
                item._id = newId;

                // Extract one of the children that's also duplicated.
                if (oldId in newParents && newParents[oldId].length > 0)
                {
                    childrenMapping[newId] = {};
                    for (let childIndex in newParents[oldId])
                    {
                        // Make sure we haven't already assigned another duplicate child of
                        // same slot and location to this parent.
                        let childId = ItemHelper.getChildId(newParents[oldId][childIndex]);

                        if (!(childId in childrenMapping[newId]))
                        {
                            childrenMapping[newId][childId] = 1;
                            newParents[oldId][childIndex].parentId = newId;
                            newParents[oldId].splice(childIndex, 1);
                        }
                    }
                }
            }
        }

        return items;
    }

    static arrayIntersect(a, b)
    {
        return a.filter(x => b.includes(x));
    }
}

module.exports = PlzRefactorMeHelper;
