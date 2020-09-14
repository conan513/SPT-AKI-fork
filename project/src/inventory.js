"use strict";

class InventoryController
{
    /* Based on the item action, determine whose inventories we should be looking at for from and to. */
    getOwnerInventoryItems(body, sessionID)
    {
        let isSameInventory = false;
        let pmcItems = profile_f.profileController.getPmcProfile(sessionID).Inventory.items;
        let scavData = profile_f.profileController.getScavProfile(sessionID);
        let fromInventoryItems = pmcItems;
        let fromType = "pmc";

        if ("fromOwner" in body)
        {
            if (body.fromOwner.id === scavData._id)
            {
                fromInventoryItems = scavData.Inventory.items;
                fromType = "scav";
            }
            else if (body.fromOwner.type === "Mail")
            {
                fromInventoryItems = dialogue_f.dialogueServer.getMessageItemContents(body.fromOwner.id, sessionID);
                fromType = "mail";
            }
        }

        // Don't need to worry about mail for destination because client doesn't allow
        // users to move items back into the mail stash.
        let toInventoryItems = pmcItems;
        let toType = "pmc";

        if ("toOwner" in body && body.toOwner.id === scavData._id)
        {
            toInventoryItems = scavData.Inventory.items;
            toType = "scav";
        }

        if (fromType === toType)
        {
            isSameInventory = true;
        }

        return {
            from: fromInventoryItems,
            to: toInventoryItems,
            sameInventory: isSameInventory,
            isMail: fromType === "mail"
        };
    }

    /* Move Item
    * change location of item with parentId and slotId
    * transfers items from one profile to another if fromOwner/toOwner is set in the body.
    * otherwise, move is contained within the same profile_f.
    * */
    moveItem(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
        let items = this.getOwnerInventoryItems(body, sessionID);

        if (items.sameInventory)
        {
            this.moveItemInternal(items.from, body);
        }
        else
        {
            this.moveItemToProfile(items.from, items.to, body);
        }

        return output;
    }

    /* Internal helper function to transfer an item from one profile to another.
    * fromProfileData: Profile of the source.
    * toProfileData: Profile of the destination.
    * body: Move request
    */
    moveItemToProfile(fromItems, toItems, body)
    {
        this.handleCartridges(fromItems, body);

        let idsToMove = itm_hf.findAndReturnChildrenByItems(fromItems, body.item);

        for (let itemId of idsToMove)
        {
            for (let itemIndex in fromItems)
            {
                if (fromItems[itemIndex]._id && fromItems[itemIndex]._id === itemId)
                {
                    if (itemId === body.item)
                    {
                        fromItems[itemIndex].parentId = body.to.id;
                        fromItems[itemIndex].slotId = body.to.container;

                        if ("location" in body.to)
                        {
                            fromItems[itemIndex].location = body.to.location;
                        }
                        else
                        {
                            if (fromItems[itemIndex].location)
                            {
                                delete fromItems[itemIndex].location;
                            }
                        }
                    }

                    toItems.push(fromItems[itemIndex]);
                    fromItems.splice(itemIndex, 1);
                }
            }
        }
    }

    /* Internal helper function to move item within the same profile_f.
    * items: Items
    * body: Move request
    */
    moveItemInternal(items, body)
    {
        this.handleCartridges(items, body);

        for (let item of items)
        {
            if (item._id && item._id === body.item)
            {
                item.parentId = body.to.id;
                item.slotId = body.to.container;

                if ("location" in body.to)
                {
                    item.location = body.to.location;
                }
                else
                {
                    if (item.location)
                    {
                        delete item.location;
                    }
                }

                return;
            }
        }
    }

    /* Internal helper function to handle cartridges in inventory if any of them exist.
    * items: Items
    * body: Move request
    */
    handleCartridges(items, body)
    {
        // -> Move item to diffrent place - counts with equiping filling magazine etc
        if (body.to.container === "cartridges")
        {
            let tmp_counter = 0;

            for (let item_ammo in items)
            {
                if (body.to.id === items[item_ammo].parentId)
                {
                    tmp_counter++;
                }
            }

            body.to.location = tmp_counter;//wrong location for first cartrige
        }
    }

    /* Remove item of itemId and all of its descendants from profile. */
    removeItemFromProfile(profileData, itemId, output = null)
    {
        // get items to remove
        let ids_toremove = itm_hf.findAndReturnChildren(profileData, itemId);

        //remove one by one all related items and itself
        for (let i in ids_toremove)
        {
            if (output !== null)
            {
                output.items.del.push({"_id": ids_toremove[i]});
            }

            for (let a in profileData.Inventory.items)
            {
                if (profileData.Inventory.items[a]._id === ids_toremove[i])
                {
                    profileData.Inventory.items.splice(a, 1);
                }
            }
        }
    }

    /*
    * Remove Item
    * Deep tree item deletion / Delets main item and all sub items with sub items ... and so on.
    */
    removeItem(profileData, body, output, sessionID)
    {
        let toDo = [body];

        //Find the item and all of it's relates
        if (toDo[0] === undefined || toDo[0] === null || toDo[0] === "undefined")
        {
            logger.logError("item id is not valid");
            return "";
        }

        this.removeItemFromProfile(profileData, toDo[0], output);
        return output;
    }

    discardItem(pmcData, body, sessionID)
    {
        insurance_f.insuranceServer.remove(pmcData, body.item, sessionID);
        return this.removeItem(pmcData, body.item, item_f.itemServer.getOutput(), sessionID);
    }

    /* Split Item
    * spliting 1 item into 2 separate items ...
    * */
    splitItem(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
        let location = body.container.location;

        let items = this.getOwnerInventoryItems(body, sessionID);

        if (!("location" in body.container) && body.container.container === "cartridges")
        {
            let tmp_counter = 0;

            for (let item_ammo in items.to)
            {
                if (items.to[item_ammo].parentId === body.container.id)
                {
                    tmp_counter++;
                }
            }

            location = tmp_counter;//wrong location for first cartrige
        }


        // The item being merged is possible from three different sources: pmc, scav, or mail.
        for (let item of items.from)
        {
            if (item._id && item._id === body.item)
            {
                item.upd.StackObjectsCount -= body.count;

                let newItem = utility.generateNewItemId();

                output.items.new.push({
                    "_id": newItem,
                    "_tpl": item._tpl,
                    "parentId": body.container.id,
                    "slotId": body.container.container,
                    "location": location,
                    "upd": {"StackObjectsCount": body.count}
                });

                items.to.push({
                    "_id": newItem,
                    "_tpl": item._tpl,
                    "parentId": body.container.id,
                    "slotId": body.container.container,
                    "location": location,
                    "upd": {"StackObjectsCount": body.count}
                });

                return output;
            }
        }

        return "";
    }

    /* Merge Item
    * merges 2 items into one, deletes item from body.item and adding number of stacks into body.with
    * */
    mergeItem(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
        let items = this.getOwnerInventoryItems(body, sessionID);

        for (let key in items.to)
        {
            if (items.to[key]._id === body.with)
            {
                for (let key2 in items.from)
                {
                    if (items.from[key2]._id && items.from[key2]._id === body.item)
                    {
                        let stackItem0 = 1;
                        let stackItem1 = 1;

                        if (!(items.to[key].upd && items.to[key].upd.StackObjectsCount))
                        {
                            items.to[key].upd = {"StackObjectsCount" : 1};
                        }
                        else if (!(items.from[key2].upd && items.from[key2].upd.StackObjectsCount))
                        {
                            items.from[key2].upd = {"StackObjectsCount" : 1};
                        }

                        if ("upd" in items.to[key])
                        {
                            stackItem0 = items.to[key].upd.StackObjectsCount;
                        }

                        if ("upd" in items.from[key2])
                        {
                            stackItem1 = items.from[key2].upd.StackObjectsCount;
                        }

                        if (stackItem0 === 1)
                        {
                            Object.assign(items.to[key], {"upd": {"StackObjectsCount": 1}});
                        }

                        items.to[key].upd.StackObjectsCount = stackItem0 + stackItem1;
                        output.items.del.push({"_id": items.from[key2]._id});
                        items.from.splice(key2, 1);
                        return output;
                    }
                }
            }
        }

        return "";
    }

    /* Transfer item
    * Used to take items from scav inventory into stash or to insert ammo into mags (shotgun ones) and reloading weapon by clicking "Reload"
    * */
    transferItem(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
        let itemFrom = null;
        let itemTo = null;

        for (let iterItem of pmcData.Inventory.items)
        {
            if (iterItem._id === body.item)
            {
                itemFrom = iterItem;
            }
            else if (iterItem._id === body.with)
            {
                itemTo = iterItem;
            }

            if (itemFrom !== null && itemTo !== null)
            {
                break;
            }
        }

        if (itemFrom !== null && itemTo !== null)
        {
            let stackFrom = 1;

            if ("upd" in itemFrom)
            {
                stackFrom = itemFrom.upd.StackObjectsCount;
            }
            else
            {
                Object.assign(itemFrom, {"upd": {"StackObjectsCount": 1}});
            }

            if (stackFrom > body.count)
            {
                itemFrom.upd.StackObjectsCount = stackFrom - body.count;
            }
            else
            {
                // Moving a full stack onto a smaller stack
                itemFrom.upd.StackObjectsCount = stackFrom - 1;
            }

            let stackTo = 1;

            if ("upd" in itemTo)
            {
                stackTo = itemTo.upd.StackObjectsCount;
            }
            else
            {
                Object.assign(itemTo, {"upd": {"StackObjectsCount": 1}});
            }

            itemTo.upd.StackObjectsCount = stackTo + body.count;
        }

        return output;
    }

    /* Swap Item
    * its used for "reload" if you have weapon in hands and magazine is somewhere else in rig or backpack in equipment
    * */
    swapItem(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        for (let iterItem of pmcData.Inventory.items)
        {
            if (iterItem._id === body.item)
            {
                iterItem.parentId = body.to.id;         // parentId
                iterItem.slotId = body.to.container;    // slotId
                iterItem.location = body.to.location;    // location
            }

            if (iterItem._id === body.item2)
            {
                iterItem.parentId = body.to2.id;
                iterItem.slotId = body.to2.container;
                delete iterItem.location;
            }
        }

        return output;
    }

    /* Give Item
    * its used for "add" item like gifts etc.
    * */
    addItem(pmcData, body, output, sessionID, callback, foundInRaid = false)
    {
        const fenceID = "579dc571d53a0658a154fbec";
        let PlayerStash = itm_hf.getPlayerStash(sessionID);
        let stashY = PlayerStash[1];
        let stashX = PlayerStash[0];
        let itemLib = [];
        let itemsToAdd = [];

        for (let baseItem of body.items)
        {
            if (baseItem.item_id in database_f.database.tables.globals.ItemPresets)
            {
                const presetItems = itm_hf.clone(database_f.database.tables.globals.ItemPresets[baseItem.item_id]._items);
                itemLib.push(...presetItems);
                baseItem.isPreset = true;
                baseItem.item_id = presetItems[0]._id;
            }
            else if (body.tid === fenceID)
            {
                const item = database_f.database.tables.traders[fenceID].items[baseItem.item_id];
                itemLib.push({ _id: baseItem.item_id, _tpl: item._tpl });
            }
            else
            {
                // Only grab the relevant trader items and add unique values
                const traderItems = trader_f.traderServer.getAssort(sessionID, body.tid).items;
                const relevantItems = itm_hf.findAndReturnChildrenAsItems(traderItems, baseItem.item_id);
                const toAdd = relevantItems.filter(traderItem => !itemLib.some(item => traderItem._id === item._id));
                itemLib.push(...toAdd);
            }

            for (let item of itemLib)
            {
                if (item._id === baseItem.item_id)
                {
                    const tmpItem = itm_hf.getItem(item._tpl)[1];
                    const itemToAdd = { itemRef: item, count: baseItem.count, isPreset: baseItem.isPreset };
                    let MaxStacks = 1;

                    // split stacks if the size is higher than allowed by StackMaxSize
                    if (baseItem.count > tmpItem._props.StackMaxSize)
                    {
                        let count = baseItem.count;
                        let calc = baseItem.count - (Math.floor(baseItem.count / tmpItem._props.StackMaxSize) * tmpItem._props.StackMaxSize);

                        MaxStacks = (calc > 0) ? MaxStacks + Math.floor(count / tmpItem._props.StackMaxSize) : Math.floor(count / tmpItem._props.StackMaxSize);

                        for (let sv = 0; sv < MaxStacks; sv++)
                        {
                            if (count > 0)
                            {
                                let newItemToAdd = itm_hf.clone(itemToAdd);
                                if (count > tmpItem._props.StackMaxSize)
                                {
                                    count = count - tmpItem._props.StackMaxSize;
                                    newItemToAdd.count = tmpItem._props.StackMaxSize;
                                }
                                else
                                {
                                    newItemToAdd.count = count;
                                }
                                itemsToAdd.push(newItemToAdd);
                            }
                        }
                    }
                    else
                    {
                        itemsToAdd.push(itemToAdd);
                    }
                    // stacks prepared
                }
            }
        }

        // Find an empty slot in stash for each of the items being added
        let StashFS_2D = itm_hf.recheckInventoryFreeSpace(pmcData, sessionID);
        for (let itemToAdd of itemsToAdd)
        {
            let findSlotResult = this.findSlotForItem(StashFS_2D, stashX, stashY, itemToAdd.itemRef, itemLib);

            if (findSlotResult.success)
            {
                /* Fill in the StashFS_2D with an imaginary item, to simulate it already being added
                * so the next item to search for a free slot won't find the same one */
                let itemSize = itm_hf.getSize(itemToAdd.itemRef._tpl, itemToAdd.itemRef._id, itemLib);
                let itemSizeX = findSlotResult.rotation ? itemSize[1] : itemSize[0];
                let itemSizeY = findSlotResult.rotation ? itemSize[0] : itemSize[1];

                for (let tmpY = findSlotResult.y; tmpY < findSlotResult.y + itemSizeY; tmpY++)
                {
                    for (let tmpX = findSlotResult.x; tmpX < findSlotResult.x + itemSizeX; tmpX++)
                    {
                        if (StashFS_2D[tmpY][tmpX] === 0)
                        {
                            StashFS_2D[tmpY][tmpX] = 1;
                        }
                        else
                        {
                            // Something went wrong - the slot is already filled!
                            logger.logError("FindSlotForItem probably didn't work correctly!");
                            return itm_hf.appendErrorToOutput(output, "Not enough stash space");
                        }
                    }
                }

                itemToAdd.location = { x: findSlotResult.x, y: findSlotResult.y, rotation: findSlotResult.rotation };
            }
            else
            {
                return itm_hf.appendErrorToOutput(output, "Not enough stash space");
            }
        }

        // We've succesfully found a slot for each item, let's execute the callback and see if it fails (ex. payMoney might fail)
        try
        {
            if (typeof callback === "function")
            {
                callback();
            }
        }
        catch (err)
        {
            let message = typeof err === "string" ? err : "An unknown error occurred";
            return itm_hf.appendErrorToOutput(output, message);
        }

        for (let itemToAdd of itemsToAdd)
        {
            let newItem = utility.generateNewItemId();
            let toDo = [[itemToAdd.itemRef._id, newItem]];
            let upd = {"StackObjectsCount": itemToAdd.count};

            //if it is from ItemPreset, load preset's upd data too.
            if (itemToAdd.isPreset)
            {
                for (let updID in itemToAdd.itemRef.upd)
                {
                    upd[updID] = itemToAdd.itemRef.upd[updID];
                }
            }

            // in case people want all items to be marked as found in raid
            if (gameplayConfig.trading.buyItemsMarkedFound)
            {
                foundInRaid = true;
            }

            // hideout items need to be marked as found in raid
            if (foundInRaid)
            {
                upd["SpawnedInSession"] = true;
            }

            output.items.new.push({
                "_id": newItem,
                "_tpl": itemToAdd.itemRef._tpl,
                "parentId": pmcData.Inventory.stash,
                "slotId": "hideout",
                "location": {"x": itemToAdd.location.x, "y": itemToAdd.location.y, "r": itemToAdd.location.rotation ? 1 : 0},
                "upd": upd
            });

            pmcData.Inventory.items.push({
                "_id": newItem,
                "_tpl": itemToAdd.itemRef._tpl,
                "parentId": pmcData.Inventory.stash,
                "slotId": "hideout",
                "location": {"x": itemToAdd.location.x, "y": itemToAdd.location.y, "r": itemToAdd.location.rotation ? 1 : 0},
                "upd": upd
            });

            // If this is an ammobox, add cartridges to it.
            // Damaged ammo box are not loaded.
            const itemInfo = itm_hf.getItem(itemToAdd.itemRef._tpl)[1];
            let ammoBoxInfo = itemInfo._props.StackSlots;
            if (ammoBoxInfo !== undefined && itemInfo._name.indexOf("_damaged") < 0)
            {
                // Cartridge info seems to be an array of size 1 for some reason... (See AmmoBox constructor in client code)
                let maxCount = ammoBoxInfo[0]._max_count;
                let ammoTmplId = ammoBoxInfo[0]._props.filters[0].Filter[0];
                let ammoStackMaxSize = itm_hf.getItem(ammoTmplId)[1]._props.StackMaxSize;
                let ammos = [];
                let location = 0;

                while (maxCount > 0)
                {
                    let ammoStackSize = maxCount <= ammoStackMaxSize ? maxCount : ammoStackMaxSize;
                    ammos.push({
                        "_id": utility.generateNewItemId(),
                        "_tpl": ammoTmplId,
                        "parentId": toDo[0][1],
                        "slotId": "cartridges",
                        "location": location,
                        "upd": {"StackObjectsCount": ammoStackSize}
                    });

                    location++;
                    maxCount -= ammoStackMaxSize;
                }

                [output.items.new, pmcData.Inventory.items].forEach(x => x.push.apply(x, ammos));
            }

            while (toDo.length > 0)
            {
                for (let tmpKey in itemLib)
                {
                    if (itemLib[tmpKey].parentId && itemLib[tmpKey].parentId === toDo[0][0])
                    {
                        newItem = utility.generateNewItemId();

                        let SlotID = itemLib[tmpKey].slotId;

                        //if it is from ItemPreset, load preset's upd data too.
                        if (itemToAdd.isPreset)
                        {
                            upd = {"StackObjectsCount": itemToAdd.count};
                            for (let updID in itemLib[tmpKey].upd)
                            {
                                upd[updID] = itemLib[tmpKey].upd[updID];
                            }
                        }

                        if (SlotID === "hideout")
                        {
                            output.items.new.push({
                                "_id": newItem,
                                "_tpl": itemLib[tmpKey]._tpl,
                                "parentId": toDo[0][1],
                                "slotId": SlotID,
                                "location": {"x": itemToAdd.location.x, "y": itemToAdd.location.y, "r": "Horizontal"},
                                "upd": upd
                            });

                            pmcData.Inventory.items.push({
                                "_id": newItem,
                                "_tpl": itemLib[tmpKey]._tpl,
                                "parentId": toDo[0][1],
                                "slotId": itemLib[tmpKey].slotId,
                                "location": {"x": itemToAdd.location.x, "y": itemToAdd.location.y, "r": "Horizontal"},
                                "upd": upd
                            });
                        }
                        else
                        {
                            output.items.new.push({
                                "_id": newItem,
                                "_tpl": itemLib[tmpKey]._tpl,
                                "parentId": toDo[0][1],
                                "slotId": SlotID,
                                "upd": upd
                            });

                            pmcData.Inventory.items.push({
                                "_id": newItem,
                                "_tpl": itemLib[tmpKey]._tpl,
                                "parentId": toDo[0][1],
                                "slotId": itemLib[tmpKey].slotId,
                                "upd": upd
                            });
                        }

                        toDo.push([itemLib[tmpKey]._id, newItem]);
                    }
                }

                toDo.splice(0, 1);
            }
        }
        return output;

        // return itm_hf.appendErrorToOutput(output, "An unknown error occurred");
    }

    findSlotForItem(StashFS_2D, stashX, stashY, item, items)
    {
        let ItemSize = itm_hf.getSize(item._tpl, item._id, items);
        let tmpSizeX = ItemSize[0];
        let tmpSizeY = ItemSize[1];
        let rotation = false;
        let minVolume = (tmpSizeX < tmpSizeY ? tmpSizeX : tmpSizeY) - 1;
        let limitY = stashY - minVolume;
        let limitX = stashX - minVolume;

        for (let y = 0; y < limitY; y++)
        {
            for (let x = 0; x < limitX; x++)
            {
                let foundSlot = true;
                for (let itemY = 0; itemY < tmpSizeY; itemY++)
                {
                    if (foundSlot && y + tmpSizeY - 1 > stashY - 1)
                    {
                        foundSlot = false;
                        break;
                    }

                    for (let itemX = 0; itemX < tmpSizeX; itemX++)
                    {
                        if (foundSlot && x + tmpSizeX - 1 > stashX - 1)
                        {
                            foundSlot = false;
                            break;
                        }

                        if (StashFS_2D[y + itemY][x + itemX] !== 0)
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

                /**Try to rotate if there is enough room for the item
                 * Only occupies one grid of items, no rotation required
                 * */
                if (!foundSlot && tmpSizeX * tmpSizeY > 1)
                {
                    foundSlot = true;
                    for (let itemY = 0; itemY < tmpSizeX; itemY++)
                    {
                        if (foundSlot && y + tmpSizeX - 1 > stashY - 1)
                        {
                            foundSlot = false;
                            break;
                        }
                        for (let itemX = 0; itemX < tmpSizeY; itemX++)
                        {
                            if (foundSlot && x + tmpSizeY - 1 > stashX - 1)
                            {
                                foundSlot = false;
                                break;
                            }

                            if (StashFS_2D[y + itemY][x + itemX] !== 0)
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

    foldItem(pmcData, body, sessionID)
    {
        for (let item of pmcData.Inventory.items)
        {
            if (item._id && item._id === body.item)
            {
                item.upd.Foldable = {"Folded": body.value};
                return item_f.itemServer.getOutput();
            }
        }

        return "";
    }

    toggleItem(pmcData, body, sessionID)
    {
        for (let item of pmcData.Inventory.items)
        {
            if (item._id && item._id === body.item)
            {
                item.upd.Togglable = {"On": body.value};
                return item_f.itemServer.getOutput();
            }
        }

        return "";
    }

    tagItem(pmcData, body, sessionID)
    {
        for (let item of pmcData.Inventory.items)
        {
            if (item._id === body.item)
            {
                if ("upd" in item)
                {
                    item.upd.Tag = {"Color": body.TagColor, "Name": body.TagName};
                }
                else
                {
                    //if object doesn't have upd create and add it
                    let myobject = {
                        "_id": item._id,
                        "_tpl": item._tpl,
                        "parentId": item.parentId,
                        "slotId": item.slotId,
                        "location": item.location,
                        "upd": {"Tag": {"Color": body.TagColor, "Name": body.TagName}}
                    };

                    // merge myobject into item -- overwrite same properties and add missings
                    Object.assign(item, myobject);
                }

                return item_f.itemServer.getOutput();
            }
        }

        return "";
    }

    bindItem(pmcData, body, sessionID)
    {
        for (let index in pmcData.Inventory.fastPanel)
        {
            if (pmcData.Inventory.fastPanel[index] === body.item)
            {
                pmcData.Inventory.fastPanel[index] = "";
            }
        }

        pmcData.Inventory.fastPanel[body.index] = body.item;
        return item_f.itemServer.getOutput();
    }

    examineItem(pmcData, body, sessionID)
    {
        let itemID = "";
        let items = pmcData.Inventory.items;

        // outside player profile
        if ("fromOwner" in body)
        {
            // scan ragfair as a trader
            if (body.fromOwner.type === "RagFair")
            {
                body.item = body.fromOwner.id;
                body.fromOwner.type = "Trader";
                body.fromOwner.id = "ragfair";
            }

            // get trader assort
            if (body.fromOwner.type === "Trader")
            {
                items = trader_f.traderServer.getAssort(sessionID, body.fromOwner.id).items;
            }

            // get hideout item
            if (body.fromOwner.type === "HideoutProduction")
            {
                itemID = body.item;
            }
        }

        if (preset_f.itemPresets.isPreset(itemID))
        {
            itemID = preset_f.itemPresets.getBaseItemTpl(itemID);
        }

        if (itemID === "")
        {
            // player/trader inventory
            for (let item of items)
            {
                if (item._id === body.item)
                {
                    itemID = item._tpl;
                    break;
                }
            }
        }

        if (itemID === "")
        {
            // player/trader inventory
            let result = itm_hf.getItem(body.item);
            if (result[0])
            {
                itemID = result[1]._id;
            }
        }

        // item not found
        if (itemID === "")
        {
            logger.logError("Cannot find item to examine");
            return "";
        }

        // item found
        let item = database_f.database.tables.templates.items[itemID];
        pmcData.Info.Experience += item._props.ExamineExperience;
        pmcData.Encyclopedia[itemID] = true;

        logger.logSuccess("EXAMINED: " + itemID);
        return item_f.itemServer.getOutput();
    }

    readEncyclopedia(pmcData, body, sessionID)
    {
        for (let id of body.ids)
        {
            pmcData.Encyclopedia[id] = true;
        }

        return item_f.itemServer.getOutput();
    }
}

class InventoryCallbacks
{
    constructor()
    {
        item_f.itemServer.addRoute("Move", this.moveItem.bind());
        item_f.itemServer.addRoute("Remove", this.removeItem.bind());
        item_f.itemServer.addRoute("Split", this.splitItem.bind());
        item_f.itemServer.addRoute("Merge", this.mergeItem.bind());
        item_f.itemServer.addRoute("Transfer", this.transferItem.bind());
        item_f.itemServer.addRoute("Swap", this.swapItem.bind());
        item_f.itemServer.addRoute("Fold", this.foldItem.bind());
        item_f.itemServer.addRoute("Toggle", this.toggleItem.bind());
        item_f.itemServer.addRoute("Tag", this.tagItem.bind());
        item_f.itemServer.addRoute("Bind", this.bindItem.bind());
        item_f.itemServer.addRoute("Examine", this.examineItem.bind());
        item_f.itemServer.addRoute("ReadEncyclopedia", this.readEncyclopedia.bind());
    }

    moveItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.moveItem(pmcData, body, sessionID);
    }

    removeItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.discardItem(pmcData, body, sessionID);
    }

    splitItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.splitItem(pmcData, body, sessionID);
    }

    mergeItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.mergeItem(pmcData, body, sessionID);
    }

    transferItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.transferItem(pmcData, body, sessionID);
    }

    swapItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.swapItem(pmcData, body, sessionID);
    }

    foldItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.foldItem(pmcData, body, sessionID);
    }

    toggleItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.toggleItem(pmcData, body, sessionID);
    }

    tagItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.tagItem(pmcData, body, sessionID);
    }

    bindItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.bindItem(pmcData, body, sessionID);
    }

    examineItem(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.examineItem(pmcData, body, sessionID);
    }

    readEncyclopedia(pmcData, body, sessionID)
    {
        return inventory_f.inventoryController.readEncyclopedia(pmcData, body, sessionID);
    }
}

module.exports.inventoryController = new InventoryController();
module.exports.inventoryCallbacks = new InventoryCallbacks();