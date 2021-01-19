//@ts-check
/* helpfunctions.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Terkoiz
 * - Ginja
 * - Emperor06
 * - PoloYolo
 */

"use strict";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// PLEASE REFACTOR THIS //////////////////////////////////////////////
//////////////////////////////////// THIS CODE SHOULD BE STORED SOMEWHERE ELSE ///////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class PlzRefactorMeHelper
{
    /**
     * @param {itemTemplate[]} items
     */
    getSecureContainer(items)
    {
        // Player Slots we care about
        const inventorySlots = [
            "SecuredContainer",
        ];
        /** @type {itemTemplate[]} */
        let inventoryItems = [];

        // Get an array of root player items
        for (let item of items)
        {
            if (inventorySlots.includes(item.slotId))
            {
                inventoryItems.push(item);
            }
        }

        // Loop through these items and get all of their children
        let newItems = inventoryItems;

        while (newItems.length > 0)
        {
            let foundItems = [];

            for (let item of newItems)
            {
                for (let newItem of items)
                {
                    if (newItem.parentId === item._id)
                    {
                        foundItems.push(newItem);
                    }
                }
            }

            // Add these new found items to our list of inventory items
            inventoryItems = [
                ...inventoryItems,
                ...foundItems,
            ];

            // Now find the children of these items
            newItems = foundItems;
        }

        return inventoryItems;
    }

    /**
     * @param {hash} sessionID
     */
    getStashType(sessionID)
    {
        /** @type {UserPMCProfile} */
        const pmcData = profile_f.controller.getPmcProfile(sessionID);

        const stashObj = pmcData.Inventory.items.find(item => item._id === pmcData.Inventory.stash);
        if (!stashObj)
        {
            common_f.logger.logError("No stash found");
            return "";
        }

        return stashObj._tpl;
    }

    /**
     * @param {UserPMCProfile} pmcData
     */
    calculateLevel(pmcData)
    {
        let exp = 0;

        for (let level in database_f.server.tables.globals.config.exp.level.exp_table)
        {
            if (pmcData.Info.Experience < exp)
            {
                break;
            }

            pmcData.Info.Level = parseInt(level);
            exp += database_f.server.tables.globals.config.exp.level.exp_table[level].exp;
        }

        return pmcData.Info.Level;
    }

    getRandomExperience()
    {
        let exp = 0;
        /** @type {array} */
        let expTable = database_f.server.tables.globals.config.exp.level.exp_table;

        // Get random level based on the exp table.
        /** @type {number} */
        let randomLevel = common_f.random.getInt(0, expTable.length - 1) + 1;

        for (let i = 0; i < randomLevel; i++)
        {
            exp += expTable[i].exp;
        }

        // Sprinkle in some random exp within the level, unless we are at max level.
        if (randomLevel < expTable.length - 1)
        {
            exp += common_f.random.getInt(0, expTable[randomLevel].exp - 1);
        }

        return exp;
    }

    /**
     * @param {UserPMCProfile} profile
     */
    generateInventoryID(profile)
    {
        let itemsByParentHash = {};
        let inventoryItemHash = {};
        let inventoryId = "";

        // Generate inventoryItem list
        for (let item of profile.Inventory.items)
        {
            inventoryItemHash[item._id] = item;

            if (item._tpl === "55d7217a4bdc2d86028b456d")
            {
                inventoryId = item._id;
                continue;
            }

            if (!("parentId" in item))
            {
                continue;
            }

            if (!(item.parentId in itemsByParentHash))
            {
                itemsByParentHash[item.parentId] = [];
            }

            itemsByParentHash[item.parentId].push(item);
        }

        // update inventoryId
        const newInventoryId = common_f.hash.generate();
        inventoryItemHash[inventoryId]._id = newInventoryId;
        profile.Inventory.equipment = newInventoryId;

        // update inventoryItem id
        if (inventoryId in itemsByParentHash)
        {
            for (let item of itemsByParentHash[inventoryId])
            {
                item.parentId = newInventoryId;
            }
        }

        return profile;
    }

    removeSecureContainer(profile)
    {
        let items = profile.Inventory.items;

        // Remove secured container
        for (let item of items)
        {
            if (item.slotId === "SecuredContainer")
            {
                let toRemove = this.findAndReturnChildrenByItems(items, item._id);
                let n = items.length;

                while (n-- > 0)
                {
                    if (toRemove.includes(items[n]._id))
                    {
                        items.splice(n, 1);
                    }
                }

                break;
            }
        }

        profile.Inventory.items = items;
        return profile;
    }

    /**
     * A reverse lookup for templates
     *
     * @return {TemplateLookup}
     * @memberof HelpFunctions
     */
    tplLookup()
    {
        if (this.tplLookup.lookup === undefined)
        {
            const lookup = {
                "items": {
                    "byId": {},
                    "byParent": {}
                },
                "categories": {
                    "byId": {},
                    "byParent": {}
                }
            };

            for (let x of database_f.server.tables.templates.handbook.Items)
            {
                lookup.items.byId[x.Id] = x.Price;
                lookup.items.byParent[x.ParentId] || (lookup.items.byParent[x.ParentId] = []);
                lookup.items.byParent[x.ParentId].push(x.Id);
            }

            for (let x of database_f.server.tables.templates.handbook.Categories)
            {
                lookup.categories.byId[x.Id] = x.ParentId ? x.ParentId : null;
                if (x.ParentId)
                { // root as no parent
                    lookup.categories.byParent[x.ParentId] || (lookup.categories.byParent[x.ParentId] = []);
                    lookup.categories.byParent[x.ParentId].push(x.Id);
                }
            }
            /** @type {TemplateLookup} */
            this.tplLookup.lookup = lookup;
        }

        return this.tplLookup.lookup;
    }

    /**
     * @param {Currency} x
     */
    getTemplatePrice(x)
    {
        return (x in this.tplLookup().items.byId) ? this.tplLookup().items.byId[x] : 1;
    }

    /* all items in template with the given parent category */
    templatesWithParent(x)
    {
        return (x in this.tplLookup().items.byParent) ? this.tplLookup().items.byParent[x] : [];
    }

    isCategory(x)
    {
        return x in this.tplLookup().categories.byId;
    }

    childrenCategories(x)
    {
        return (x in this.tplLookup().categories.byParent) ? this.tplLookup().categories.byParent[x] : [];
    }

    /* Made a 2d array table with 0 - free slot and 1 - used slot
    * input: PlayerData
    * output: table[y][x]
    * */
    /**
     * @param {UserPMCProfile} pmcData
     * @param {string} sessionID
     */
    getPlayerStashSlotMap(pmcData, sessionID)
    {
        const PlayerStashSize = this.getPlayerStashSize(sessionID);
        return this.getContainerMap(PlayerStashSize[0], PlayerStashSize[1], pmcData.Inventory.items, pmcData.Inventory.stash);
    }

    /**
     * Check whether tpl is Money
     * @param {string} tpl
     * @returns {boolean}
     */
    isMoneyTpl(tpl)
    {
        return ["569668774bdc2da2298b4568", "5696686a4bdc2da3298b456a", "5449016a4bdc2d6f028b456f"].includes(tpl);
    }

    /* Gets currency TPL from TAG
    * input: currency(tag)
    * output: template ID
    * */
    /**
     * @param {string} currency
     */
    getCurrency(currency)
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
    /**
     * @param {string} currency
     */
    getCurrencyTag(currency)
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
    /**
     * @param {number} value
     * @param {string} currency
     */
    inRUB(value, currency)
    {
        return Math.round(value * this.getTemplatePrice(currency));
    }

    /**
     * Gets Ruble to Currency conversion Value
     * @param {number} value
     * @param {Currency} currency
     * @return {number} value after conversion
     */
    fromRUB(value, currency)
    {
        return Math.round(value / this.getTemplatePrice(currency));
    }

    /**
     * take money and insert items into return to server request
     * @param {UserPMCProfile} pmcData
     * @param {{ Action?: any; tid: any; scheme_items: any; }} body
     * @param {string} sessionID
     * @returns {boolean}
     */
    payMoney(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();
        let trader = trader_f.controller.getTrader(body.tid, sessionID);
        let currencyTpl = this.getCurrency(trader.currency);

        // delete barter things(not a money) from inventory
        if (body.Action === "TradingConfirm")
        {
            for (let index in body.scheme_items)
            {
                let item = pmcData.Inventory.items.find(i => i._id === body.scheme_items[index].id);

                if (item !== undefined)
                {
                    if (!this.isMoneyTpl(item._tpl))
                    {
                        output = inventory_f.controller.removeItem(pmcData, item._id, output, sessionID);
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
        const moneyItems = this.findBarterItems("tpl", pmcData, currencyTpl);

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
                output = inventory_f.controller.removeItem(pmcData, moneyItem._id, output, sessionID);
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
        let saleSum = pmcData.TraderStandings[body.tid].currentSalesSum += this.fromRUB(this.inRUB(barterPrice, currencyTpl), this.getCurrency(trader.currency));

        pmcData.TraderStandings[body.tid].currentSalesSum = saleSum;
        trader_f.controller.lvlUp(body.tid, sessionID);
        output.currentSalesSums[body.tid] = saleSum;

        // save changes
        common_f.logger.logSuccess("Items taken. Status OK.");
        item_f.eventHandler.setOutput(output);
        return true;
    }

    /**
     * Find Barter items in the inventory
     * @param {"tpl"} by
     * @param {UserPMCProfile} pmcData
     * @param {string} barter_itemID
     * @returns {itemTemplate[]}
     */
    findBarterItems(by, pmcData, barter_itemID)
    { // find required items to take after buying (handles multiple items)
        const barterIDs = typeof barter_itemID === "string" ? [barter_itemID] : barter_itemID;
        /** @type {itemTemplate[]} */
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
     * Recursively checks if the given item is
     * inside the stash, that is it has the stash as
     * ancestor with slotId=hideout
     *
     * @param {UserPMCProfile} pmcData
     * @param {itemTemplate} item
     */
    isItemInStash(pmcData, item)
    {
        let container = item;

        while ("parentId" in container)
        {
            if (container.parentId === pmcData.Inventory.stash && container.slotId === "hideout")
            {
                return true;
            }

            container = pmcData.Inventory.items.find(i => i._id === container.parentId);

            if (!container)
            {
                break;
            }
        }

        return false;
    }




    /**
     * receive money back after selling
     * @param {UserPMCProfile} pmcData
     * @param {number} amount numberToReturn
     * @param {{ tid: string | number; }} body request.body
     * @param {apiEventResponse} output
     * @param {any} sessionID
     * @returns none (output is sended to item.js, and profile is saved to file)
     */
    getMoney(pmcData, amount, body, output, sessionID)
    {
        let trader = trader_f.controller.getTrader(body.tid, sessionID);
        let currency = this.getCurrency(trader.currency);
        let calcAmount = this.fromRUB(this.inRUB(amount, currency), currency);
        let maxStackSize = database_f.server.tables.templates.items[currency]._props.StackMaxSize;
        let skip = false;

        for (let item of pmcData.Inventory.items)
        {
            // item is not currency
            if (item._tpl !== currency)
            {
                continue;
            }

            // item is not in the stash
            if (!this.isItemInStash(pmcData, item))
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

            output = inventory_f.controller.addItem(pmcData, request, output, sessionID, null, false);
        }

        // set current sale sum
        let saleSum = pmcData.TraderStandings[body.tid].currentSalesSum + amount;

        pmcData.TraderStandings[body.tid].currentSalesSum = saleSum;
        trader_f.controller.lvlUp(body.tid, sessionID);
        output.currentSalesSums[body.tid] = saleSum;

        return output;
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

    /* Get Player Stash Proper Size
    * input: null
    * output: [stashSizeWidth, stashSizeHeight]
    * */
    getPlayerStashSize(sessionID)
    { //this sets automaticly a stash size from items.json (its not added anywhere yet cause we still use base stash)
        let stashTPL = this.getStashType(sessionID);
        let stashX = (database_f.server.tables.templates.items[stashTPL]._props.Grids[0]._props.cellsH !== 0) ? database_f.server.tables.templates.items[stashTPL]._props.Grids[0]._props.cellsH : 10;
        let stashY = (database_f.server.tables.templates.items[stashTPL]._props.Grids[0]._props.cellsV !== 0) ? database_f.server.tables.templates.items[stashTPL]._props.Grids[0]._props.cellsV : 66;
        return [stashX, stashY];
    }

    /* Gets item data from items.json
    * input: Item Template ID
    * output: [ItemFound?(true,false), itemData]
    * */
    getItem(template)
    {
        // -> Gets item from <input: _tpl>
        if (template in database_f.server.tables.templates.items)
        {
            return [true, database_f.server.tables.templates.items[template]];
        }

        return [false, {}];
    }

    /**
     * @param {itemTemplate[]} InventoryItem
     */
    getInventoryItemHash(InventoryItem)
    {
        let inventoryItemHash = {
            byItemId: {},
            byParentId: {}
        };

        for (let i = 0; i < InventoryItem.length; i++)
        {
            let item = InventoryItem[i];
            inventoryItemHash.byItemId[item._id] = item;

            if (!("parentId" in item))
            {
                continue;
            }

            if (!(item.parentId in inventoryItemHash.byParentId))
            {
                inventoryItemHash.byParentId[item.parentId] = [];
            }
            inventoryItemHash.byParentId[item.parentId].push(item);
        }
        return inventoryItemHash;
    }

    /* Calculate Size of item inputed
    * inputs Item template ID, Item Id, InventoryItem (item from inventory having _id and _tpl)
    * outputs [width, height]
    * */
    /**
     * @param {itemTemplate} itemtpl
     * @param {string} itemID
     * @param {itemTemplate[]} InventoryItem
     */
    getItemSize(itemtpl, itemID, InventoryItem)
    { // -> Prepares item Width and height returns [sizeX, sizeY]
        return this.getSizeByInventoryItemHash(itemtpl, itemID, this.getInventoryItemHash(InventoryItem));
    }

    // note from 2027: there IS a thing i didn't explore and that is Merges With Children
    // -> Prepares item Width and height returns [sizeX, sizeY]
    /**
     * @param {itemTemplate} itemtpl
     * @param {string} itemID
     * @param {{ byItemId: any; byParentId: any; }} inventoryItemHash
     */
    getSizeByInventoryItemHash(itemtpl, itemID, inventoryItemHash)
    {
        let toDo = [itemID];
        let tmpItem = this.getItem(itemtpl)[1];
        let rootItem = inventoryItemHash.byItemId[itemID];
        let FoldableWeapon = tmpItem._props.Foldable || false;
        let FoldedSlot = tmpItem._props.FoldedSlot;

        let SizeUp = 0;
        let SizeDown = 0;
        let SizeLeft = 0;
        let SizeRight = 0;

        let ForcedUp = 0;
        let ForcedDown = 0;
        let ForcedLeft = 0;
        let ForcedRight = 0;
        let outX = tmpItem._props.Width;
        let outY = tmpItem._props.Height;
        let skipThisItems = ["5448e53e4bdc2d60728b4567", "566168634bdc2d144c8b456c", "5795f317245977243854e041"];
        let rootFolded = rootItem.upd && rootItem.upd.Foldable && rootItem.upd.Foldable.Folded === true;

        //The item itself is collapsible
        if (FoldableWeapon && (FoldedSlot === undefined || FoldedSlot === "") && rootFolded)
        {
            outX -= tmpItem._props.SizeReduceRight;
        }

        if (!skipThisItems.includes(tmpItem._parent))
        {
            while (toDo.length > 0)
            {
                if (toDo[0] in inventoryItemHash.byParentId)
                {
                    for (let item of inventoryItemHash.byParentId[toDo[0]])
                    {
                        //Filtering child items outside of mod slots, such as those inside containers, without counting their ExtraSize attribute
                        if (item.slotId.indexOf("mod_") < 0)
                        {
                            continue;
                        }

                        toDo.push(item._id);

                        // If the barrel is folded the space in the barrel is not counted
                        let itm = this.getItem(item._tpl)[1];
                        let childFoldable = itm._props.Foldable;
                        let childFolded = item.upd && item.upd.Foldable && item.upd.Foldable.Folded === true;

                        if (FoldableWeapon && FoldedSlot === item.slotId && (rootFolded || childFolded))
                        {
                            continue;
                        }
                        else if (childFoldable && rootFolded && childFolded)
                        {
                            continue;
                        }

                        // Calculating child ExtraSize
                        if (itm._props.ExtraSizeForceAdd === true)
                        {
                            ForcedUp += itm._props.ExtraSizeUp;
                            ForcedDown += itm._props.ExtraSizeDown;
                            ForcedLeft += itm._props.ExtraSizeLeft;
                            ForcedRight += itm._props.ExtraSizeRight;
                        }
                        else
                        {
                            SizeUp = (SizeUp < itm._props.ExtraSizeUp) ? itm._props.ExtraSizeUp : SizeUp;
                            SizeDown = (SizeDown < itm._props.ExtraSizeDown) ? itm._props.ExtraSizeDown : SizeDown;
                            SizeLeft = (SizeLeft < itm._props.ExtraSizeLeft) ? itm._props.ExtraSizeLeft : SizeLeft;
                            SizeRight = (SizeRight < itm._props.ExtraSizeRight) ? itm._props.ExtraSizeRight : SizeRight;
                        }
                    }
                }

                toDo.splice(0, 1);
            }
        }

        return [outX + SizeLeft + SizeRight + ForcedLeft + ForcedRight, outY + SizeUp + SizeDown + ForcedUp + ForcedDown];
    }

    /* Find And Return Children (TRegular)
    * input: PlayerData, InitialItem._id
    * output: list of item._id
    * List is backward first item is the furthest child and last item is main item
    * returns all child items ids in array, includes itself and children
    * */
    /**
     * @param {UserPMCProfile} pmcData
     * @param {string} itemID
     */
    findAndReturnChildren(pmcData, itemID)
    {
        return this.findAndReturnChildrenByItems(pmcData.Inventory.items, itemID);
    }

    /**
     * @param {itemTemplate[]} items
     * @param {string} itemID
     */
    findAndReturnChildrenByItems(items, itemID)
    {
        /** @type {string[]} */
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
     * @param {itemTemplate[]} items Array of item objects, root item ID.
     * @param {string} itemID Array of item objects containing root item and its children.
     */
    findAndReturnChildrenAsItems(items, itemID)
    {
        let list = [];

        for (let childitem of items)
        {
            // Include itself.
            if (childitem._id === itemID)
            {
                list.push(childitem);
                continue;
            }

            if (childitem.parentId === itemID && !list.find((item) =>
            {
                return items._id == item._id;
            }))
            {
                list.push.apply(list, this.findAndReturnChildrenAsItems(items, childitem._id));
            }
        }

        
        return list;
    }

    /**
     * find childs of the item in a given assort (weapons pars for example, need recursive loop function)
     * @param {string} itemIdToFind
     * @param {itemTemplate[]} assort
     */
    findAndReturnChildrenByAssort(itemIdToFind, assort)
    {
        /** @type {itemTemplate[]} */
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
     * @param {string} itemId
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

    replaceIDs(pmcData, items, fastPanel = null)
    {
        // replace bsg shit long ID with proper one
        let string_inventory = common_f.json.serialize(items);

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
            let new_id = common_f.hash.generate();

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

        items = common_f.json.deserialize(string_inventory);

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
                let newId = common_f.hash.generate();

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
                        let childId = this.getChildId(newParents[oldId][childIndex]);

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


    /**
     * split item stack if it exceeds StackMaxSize
     * @param {itemTemplate} item
     * @returns {itemTemplate[]} array of these items with StackObjectsCount <= StackMaxSize
     */
    splitStack(item)
    {
        if (!("upd" in item) || !("StackObjectsCount" in item.upd))
        {
            return [item];
        }

        let maxStack = database_f.server.tables.templates.items[item._tpl]._props.StackMaxSize;
        let count = item.upd.StackObjectsCount;
        /** @type {itemTemplate[]} */
        let stacks = [];

        // If the current count is already equal or less than the max
        // then just return the item as is.
        if (count <= maxStack)
        {
            stacks.push(this.clone(item));
            return stacks;
        }

        while (count)
        {
            let amount = Math.min(count, maxStack);
            let newStack = this.clone(item);

            newStack._id = common_f.hash.generate();
            newStack.upd.StackObjectsCount = amount;
            count -= amount;
            stacks.push(newStack);
        }

        return stacks;
    }

    clone(x)
    {
        return common_f.json.deserialize(common_f.json.serialize(x));
    }

    arrayIntersect(a, b)
    {
        return a.filter(x => b.includes(x));
    }

    /**
     * @param {apiEventResponse} output
     */
    appendErrorToOutput(output, message = "An unknown error occurred", title = "Error")
    {
        output.badRequest = [{
            "index": 0,
            "err": title,
            "errmsg": message
        }];

        return output;
    }

    /* Finds a slot for an item in a given 2D container map
     * Output: { success: boolean, x: number, y: number, rotation: boolean }
     */
    findSlotForItem(container2D, itemWidth, itemHeight)
    {
        let rotation = false;
        let minVolume = (itemWidth < itemHeight ? itemWidth : itemHeight) - 1;
        let containerY = container2D.length;
        let containerX = container2D[0].length;
        let limitY = containerY - minVolume;
        let limitX = containerX - minVolume;

        let locateSlot = (x, y, itemW, itemH) =>
        {
            let foundSlot = true;
            for (let itemY = 0; itemY < itemH; itemY++)
            {
                if (foundSlot && y + itemH - 1 > containerY - 1)
                {
                    foundSlot = false;
                    break;
                }

                for (let itemX = 0; itemX < itemW; itemX++)
                {
                    if (foundSlot && x + itemW - 1 > containerX - 1)
                    {
                        foundSlot = false;
                        break;
                    }

                    if (container2D[y + itemY][x + itemX] !== 0)
                    {
                        foundSlot = false;
                        break;
                    }
                }

                if (!foundSlot)
                {
                    break;
                }
            }

            return foundSlot;
        };

        for (let y = 0; y < limitY; y++)
        {
            for (let x = 0; x < limitX; x++)
            {
                let foundSlot = locateSlot(x, y, itemWidth, itemHeight);

                /**Try to rotate if there is enough room for the item
                 * Only occupies one grid of items, no rotation required
                 * */
                if (!foundSlot && itemWidth * itemHeight > 1)
                {
                    foundSlot = locateSlot(x, y, itemHeight, itemWidth);

                    if (foundSlot)
                    {
                        rotation = true;
                    }
                }

                if (!foundSlot)
                {
                    continue;
                }

                return { success: true, x, y, rotation };
            }
        }

        return { success: false, x: null, y: null, rotation: false };
    }

    fillContainerMapWithItem(container2D, x, y, itemW, itemH, rotate)
    {
        let itemWidth = rotate ? itemH : itemW;
        let itemHeight = rotate ? itemW : itemH;

        for (let tmpY = y; tmpY < y + itemHeight; tmpY++)
        {
            for (let tmpX = x; tmpX < x + itemWidth; tmpX++)
            {
                if (container2D[tmpY][tmpX] === 0)
                {
                    container2D[tmpY][tmpX] = 1;
                }
                else
                {
                    throw `Slot at (${x}, ${y}) is already filled`;
                }
            }
        }

        return container2D;
    }

    getContainerMap(containerW, containerH, itemList, containerId)
    {
        const container2D = Array(containerH).fill(0).map(() => Array(containerW).fill(0));
        const inventoryItemHash = this.getInventoryItemHash(itemList);

        const containerItemHash = inventoryItemHash.byParentId[containerId];
        if (!containerItemHash)
        {
            // No items in the container
            return container2D;
        }

        for (const item of containerItemHash)
        {
            if (!("location" in item))
            {
                continue;
            }

            const tmpSize = this.getSizeByInventoryItemHash(item._tpl, item._id, inventoryItemHash);
            const iW = tmpSize[0]; // x
            const iH = tmpSize[1]; // y
            const fH = ((item.location.r === 1 || item.location.r === "Vertical" || item.location.rotation === "Vertical") ? iW : iH);
            const fW = ((item.location.r === 1 || item.location.r === "Vertical" || item.location.rotation === "Vertical") ? iH : iW);
            const fillTo = item.location.x + fW;

            for (let y = 0; y < fH; y++)
            {
                try
                {
                    container2D[item.location.y + y].fill(1, item.location.x, fillTo);
                }
                catch (e)
                {
                    common_f.logger.logError(`[OOB] for item with id ${item._id}; Error message: ${e}`);
                }
            }
        }

        return container2D;
    }
}

module.exports = new PlzRefactorMeHelper();
