/**
 * ItemHelper.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

const DatabaseServer = require("../servers/DatabaseServer");
const JsonUtil = require("../utils/JsonUtil");

class ItemHelper
{
    fixItemStackCount(item)
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
    getItem(template)
    {
        // -> Gets item from <input: _tpl>
        if (template in DatabaseServer.tables.templates.items)
        {
            return [true, DatabaseServer.tables.templates.items[template]];
        }

        return [false, {}];
    }

    // get normalized value (0-1) based on item condition
    getItemQualityPrice(item)
    {
        let result = 1;

        if (item.upd)
        {
            const medkit = (item.upd.MedKit) ? item.upd.MedKit : null;
            const repairable = (item.upd.Repairable) ? item.upd.Repairable : null;

            if (medkit)
            {
                // meds
                result = medkit.HpResource / this.getItem(item._tpl)[1]._props.MaxHpResource;
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

    findAndReturnChildrenByItems(items, itemID)
    {
        let list = [];

        for (let childitem of items)
        {
            if (childitem.parentId === itemID)
            {
                list.push.apply(list, this.findAndReturnChildrenByItems(items, childitem._id));
            }
        }

        list.push(itemID);// it's required
        return list;
    }

    /**
     * A variant of findAndReturnChildren where the output is list of item objects instead of their ids.
     */
    findAndReturnChildrenAsItems(items, itemID)
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

            if (childitem.parentId === itemID && !list.find((item) =>
            {
                return childitem._id === item._id;
            }))
            {
                list.push.apply(list, this.findAndReturnChildrenAsItems(items, childitem._id));
            }
        }

        return list;
    }

    /**
     * find childs of the item in a given assort (weapons pars for example, need recursive loop function)
     */
    findAndReturnChildrenByAssort(itemIdToFind, assort)
    {
        let list = [];

        for (let itemFromAssort of assort)
        {
            if (itemFromAssort.parentId === itemIdToFind && !list.find((item) =>
            {
                return itemFromAssort._id === item._id;
            }))
            {
                list.push(itemFromAssort);
                list = list.concat(this.findAndReturnChildrenByAssort(itemFromAssort._id, assort));
            }
        }

        return list;
    }

    /**
     * Is Dogtag
     * Checks if an item is a dogtag. Used under profile_f.js to modify preparePrice based
     * on the level of the dogtag
     */
    isDogtag(itemId)
    {
        return itemId === "59f32bb586f774757e1e8442" || itemId === "59f32c3b86f77472a31742f0";
    }

    isNotSellable(itemid)
    {
        let items = [
            "544901bf4bdc2ddf018b456d", //wad of rubles
            "5449016a4bdc2d6f028b456f", // rubles
            "569668774bdc2da2298b4568", // euros
            "5696686a4bdc2da3298b456a" // dolars
        ];

        return items.includes(itemid);
    }

    /* Gets the identifier for a child using slotId, locationX and locationY. */
    getChildId(item)
    {
        if (!("location" in item))
        {
            return item.slotId;
        }

        return item.slotId + "," + item.location.x + "," + item.location.y;
    }
    isItemTplStackable(tpl)
    {
        return DatabaseServer.tables.templates.items[tpl]._props.StackMaxSize > 1;
    }

    /**
     * split item stack if it exceeds StackMaxSize
     */
    splitStack(item)
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

}
module.exports = new ItemHelper();
