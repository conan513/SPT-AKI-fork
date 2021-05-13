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
     * Check whether tpl is Money
     */
    static isMoneyTpl(tpl)
    {
        return ["569668774bdc2da2298b4568", "5696686a4bdc2da3298b456a", "5449016a4bdc2d6f028b456f"].includes(tpl);
    }

    /* Gets currency TPL from TAG
    * input: currency(tag)
    * output: template ID
    * */
    static getCurrency(currency)
    {
        switch (currency)
        {
            case "EUR":
                return "569668774bdc2da2298b4568";
            case "USD":
                return "5696686a4bdc2da3298b456a";
            case "RUB":
                return "5449016a4bdc2d6f028b456f";
            default:
                return "";
        }
    }

    /* Gets currency TAG from TPL
    * input: currency(tag)
    * output: template ID
    * */
    static getCurrencyTag(currency)
    {
        switch (currency)
        {
            case "569668774bdc2da2298b4568":
                return "EUR";

            case "5696686a4bdc2da3298b456a":
                return "USD";

            case "5449016a4bdc2d6f028b456f":
                return "RUB";

            default:
                return "";
        }
    }

    /* Gets Currency to Ruble conversion Value
    * input:  value, currency tpl
    * output: value after conversion
    */
    static inRUB(value, currency)
    {
        return Math.round(value * HandbookController.getTemplatePrice(currency));
    }

    /**
     * Gets Ruble to Currency conversion Value
     */
    static fromRUB(value, currency)
    {
        let price = HandbookController.getTemplatePrice(currency);

        if (!price)
        {
            return 0;
        }

        return Math.round(value / price);
    }

    /**
     * take money and insert items into return to server request
     */
    static payMoney(pmcData, body, sessionID)
    {
        let output = ItemEventRouter.getOutput();
        let trader = TraderController.getTrader(body.tid, sessionID);
        let currencyTpl = PlzRefactorMeHelper.getCurrency(trader.currency);

        // delete barter things(not a money) from inventory
        if (body.Action === "TradingConfirm")
        {
            for (let index in body.scheme_items)
            {
                let item = pmcData.Inventory.items.find(i => i._id === body.scheme_items[index].id);

                if (item !== undefined)
                {
                    if (!PlzRefactorMeHelper.isMoneyTpl(item._tpl))
                    {
                        output = InventoryController.removeItem(pmcData, item._id, output, sessionID);
                        body.scheme_items[index].count = 0;
                    }
                    else
                    {
                        currencyTpl = item._tpl;
                        break;
                    }
                }
            }
        }

        // find all items with currency _tpl id
        const moneyItems = PlzRefactorMeHelper.findBarterItems("tpl", pmcData, currencyTpl);

        // prepare a price for barter
        let barterPrice = 0;

        for (let item of body.scheme_items)
        {
            barterPrice += item.count;
        }

        // prepare the amount of money in the profile
        let amountMoney = 0;

        for (let item of moneyItems)
        {
            amountMoney += item.upd.StackObjectsCount;
        }

        // if no money in inventory or amount is not enough we return false
        if (moneyItems.length <= 0 || amountMoney < barterPrice)
        {
            return false;
        }

        let leftToPay = barterPrice;

        for (let moneyItem of moneyItems)
        {
            let itemAmount = moneyItem.upd.StackObjectsCount;

            if (leftToPay >= itemAmount)
            {
                leftToPay -= itemAmount;
                output = InventoryController.removeItem(pmcData, moneyItem._id, output, sessionID);
            }
            else
            {
                moneyItem.upd.StackObjectsCount -= leftToPay;
                leftToPay = 0;
                output.items.change.push(moneyItem);
            }

            if (leftToPay === 0)
            {
                break;
            }
        }

        // set current sale sum
        // convert barterPrice itemTpl into RUB then convert RUB into trader currency
        let saleSum = pmcData.TraderStandings[body.tid].currentSalesSum += PlzRefactorMeHelper.fromRUB(PlzRefactorMeHelper.inRUB(barterPrice, currencyTpl), PlzRefactorMeHelper.getCurrency(trader.currency));

        pmcData.TraderStandings[body.tid].currentSalesSum = saleSum;
        TraderController.lvlUp(body.tid, sessionID);
        output.currentSalesSums[body.tid] = saleSum;

        // save changes
        Logger.success("Items taken. Status OK.");
        ItemEventRouter.setOutput(output);
        return true;
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

    /**
     * receive money back after selling
     */
    static getMoney(pmcData, amount, body, output, sessionID)
    {
        let trader = TraderController.getTrader(body.tid, sessionID);
        let currency = PlzRefactorMeHelper.getCurrency(trader.currency);
        let calcAmount = PlzRefactorMeHelper.fromRUB(PlzRefactorMeHelper.inRUB(amount, currency), currency);
        let maxStackSize = DatabaseServer.tables.templates.items[currency]._props.StackMaxSize;
        let skip = false;

        for (let item of pmcData.Inventory.items)
        {
            // item is not currency
            if (item._tpl !== currency)
            {
                continue;
            }

            // item is not in the stash
            if (!InventoryHelper.isItemInStash(pmcData, item))
            {
                continue;
            }

            if (item.upd.StackObjectsCount < maxStackSize)
            {

                if (item.upd.StackObjectsCount + calcAmount > maxStackSize)
                {
                    // calculate difference
                    calcAmount -= maxStackSize - item.upd.StackObjectsCount;
                    item.upd.StackObjectsCount = maxStackSize;
                }
                else
                {
                    skip = true;
                    item.upd.StackObjectsCount = item.upd.StackObjectsCount + calcAmount;
                }

                output.items.change.push(item);

                if (skip)
                {
                    break;
                }
                continue;
            }
        }

        if (!skip)
        {
            const request = {
                "items": [{
                    "item_id": currency,
                    "count": calcAmount,
                }],
                "tid": body.tid
            };

            output = InventoryController.addItem(pmcData, request, output, sessionID, null, false);
        }

        // set current sale sum
        let saleSum = pmcData.TraderStandings[body.tid].currentSalesSum + amount;

        pmcData.TraderStandings[body.tid].currentSalesSum = saleSum;
        TraderController.lvlUp(body.tid, sessionID);
        output.currentSalesSums[body.tid] = saleSum;

        return output;
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
