"use strict";

require("../Lib.js");

class ItemHelper
{
    static fixItemStackCount(item)
    {
        if (item.upd === undefined)
        {
            item.upd = {
                StackObjectsCount: 1
            };
        }

        if (item.upd.StackObjectsCount === undefined)
        {
            item.upd.StackObjectsCount = 1;
        }
        return item;
    }

    /* Gets item data from items.json
    * */
    static getItem(template)
    {
        // -> Gets item from <input: _tpl>
        if (template in DatabaseServer.tables.templates.items)
        {
            return [true, DatabaseServer.tables.templates.items[template]];
        }

        return [false, {}];
    }

    // get normalized value (0-1) based on item condition
    static getItemQualityPrice(item)
    {
        let result = 1;

        if (item.upd)
        {
            const medkit = (item.upd.MedKit) ? item.upd.MedKit : null;
            const repairable = (item.upd.Repairable) ? item.upd.Repairable : null;

            if (medkit)
            {
                // meds
                result = medkit.HpResource / ItemHelper.getItem(item._tpl)[1]._props.MaxHpResource;
            }

            if (repairable)
            {
                // weapons and armor
                result = repairable.Durability / repairable.MaxDurability;
            }

            if (result === 0)
            {
                // make item cheap
                result = 0.01;
            }
        }

        return result;
    }

    static findAndReturnChildrenByItems(items, itemID)
    {
        let list = [];

        for (let childitem of items)
        {
            if (childitem.parentId === itemID)
            {
                list.push.apply(list, ItemHelper.findAndReturnChildrenByItems(items, childitem._id));
            }
        }

        list.push(itemID);// it's required
        return list;
    }

    /**
     * A variant of findAndReturnChildren where the output is list of item objects instead of their ids.
     */
    static findAndReturnChildrenAsItems(items, itemID)
    {
        let list = [];

        for (let childitem of items)
        {
            // Include itself.
            if (childitem._id === itemID)
            {
                list.unshift(childitem);
                continue;
            }

            if (childitem.parentId === itemID && !list.find(item => childitem._id === item._id))
            {
                list.push.apply(list, ItemHelper.findAndReturnChildrenAsItems(items, childitem._id));
            }
        }
        return list;
    }

    /**
     * find childs of the item in a given assort (weapons pars for example, need recursive loop function)
     */
    static findAndReturnChildrenByAssort(itemIdToFind, assort)
    {
        let list = [];

        for (let itemFromAssort of assort)
        {
            if (itemFromAssort.parentId === itemIdToFind && !list.find(item => itemFromAssort._id === item._id))
            {
                list.push(itemFromAssort);
                list = list.concat(ItemHelper.findAndReturnChildrenByAssort(itemFromAssort._id, assort));
            }
        }

        return list;
    }

    /**
     * Is Dogtag
     * Checks if an item is a dogtag. Used under profile_f.js to modify preparePrice based
     * on the level of the dogtag
     */
    static isDogtag(itemId)
    {
        return itemId === "59f32bb586f774757e1e8442" || itemId === "59f32c3b86f77472a31742f0";
    }

    static isNotSellable(itemid)
    {
        let items = [
            "544901bf4bdc2ddf018b456d", //wad of rubles
            "5449016a4bdc2d6f028b456f", // rubles
            "569668774bdc2da2298b4568", // euros
            "5696686a4bdc2da3298b456a"  // dollars
        ];

        return items.includes(itemid);
    }

    /* Gets the identifier for a child using slotId, locationX and locationY. */
    static getChildId(item)
    {
        if (!("location" in item))
        {
            return item.slotId;
        }
        return `${item.slotId},${item.location.x},${item.location.y}`;
    }

    static isItemTplStackable(tpl)
    {
        return DatabaseServer.tables.templates.items[tpl]._props.StackMaxSize > 1;
    }

    /**
     * split item stack if it exceeds StackMaxSize
     */
    static splitStack(item)
    {
        if (!("upd" in item) || !("StackObjectsCount" in item.upd))
        {
            return [item];
        }

        let maxStack = DatabaseServer.tables.templates.items[item._tpl]._props.StackMaxSize;
        let count = item.upd.StackObjectsCount;
        let stacks = [];

        // If the current count is already equal or less than the max
        // then just return the item as is.
        if (count <= maxStack)
        {
            stacks.push(JsonUtil.clone(item));
            return stacks;
        }

        while (count)
        {
            let amount = Math.min(count, maxStack);
            let newStack = JsonUtil.clone(item);

            newStack._id = HashUtil.generate();
            newStack.upd.StackObjectsCount = amount;
            count -= amount;
            stacks.push(newStack);
        }

        return stacks;
    }

    /**
     * Find Barter items in the inventory
     * @param {string} by
     * @param {Object} pmcData
     * @param {string} barter_itemID
     * @returns Array
     */
    static findBarterItems(by, pmcData, barter_itemID)
    { // find required items to take after buying (handles multiple items)
        const barterIDs = typeof barter_itemID === "string" ? [barter_itemID] : barter_itemID;
        let itemsArray = [];

        for (const barterID of barterIDs)
        {
            const filterResult = pmcData.Inventory.items.filter(item =>
            {
                return by === "tpl" ? (item._tpl === barterID) : (item._id === barterID);
            });
            itemsArray = Object.assign(itemsArray, filterResult);
        }
        return itemsArray;
    }

    /**
     * @param {Object} pmcData
     * @param {Array} items
     * @param {Object} fastPanel
     * @returns Array
     */
    static replaceIDs(pmcData, items, insuredItems = null, fastPanel = null)
    {
        // replace bsg shit long ID with proper one
        let string_inventory = JsonUtil.serialize(items);

        for (let item of items)
        {
            if (pmcData !== null)
            {
                // insured items shouldn't be renamed
                // only works for pmcs.
                if (insuredItems && insuredItems.find(insuredItem => insuredItem.itemId === item._id))
                {
                    continue;
                }

                // do not replace important ID's
                if (item._id === pmcData.Inventory.equipment
                    || item._id === pmcData.Inventory.questRaidItems
                    || item._id === pmcData.Inventory.questStashItems
                    || item._id === pmcData.Inventory.sortingTable
                    || item._id === pmcData.Inventory.stash)
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
}

module.exports = ItemHelper;
