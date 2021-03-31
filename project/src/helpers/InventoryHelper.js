/**
 * InventoryHelper.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

const DatabaseServer = require("../servers/DatabaseServer");
const HashUtil = require("../utils/HashUtil");
const Logger = require("../utils/Logger");
const ItemHelper = require("./ItemHelper");

/*
 * @class InventoryHelper
 * @description Helpers related to Inventory
 */
class InventoryHelper
{
    /**
   * @param {itemTemplate[]} items
   */
    getSecureContainer(items)
    {
    // Player Slots we care about
        const inventorySlots = ["SecuredContainer"];
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
            inventoryItems = [...inventoryItems, ...foundItems];

            // Now find the children of these items
            newItems = foundItems;
        }

        return inventoryItems;
    }

    removeSecureContainer(profile)
    {
        let items = profile.Inventory.items;

        // Remove secured container
        for (let item of items)
        {
            if (item.slotId === "SecuredContainer")
            {
                let toRemove = ItemHelper.findAndReturnChildrenByItems(items, item._id);
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
   * @param {hash} sessionID
   */
    getStashType(sessionID)
    {
    /** @type {UserPMCProfile} */
        const pmcData = profile_f.controller.getPmcProfile(sessionID);

        const stashObj = pmcData.Inventory.items.find(
            (item) => item._id === pmcData.Inventory.stash
        );
        if (!stashObj)
        {
            Logger.error("No stash found");
            return "";
        }

        return stashObj._tpl;
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
        const newInventoryId = HashUtil.generate();
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
    {
    // -> Prepares item Width and height returns [sizeX, sizeY]
        return this.getSizeByInventoryItemHash(
            itemtpl,
            itemID,
            this.getInventoryItemHash(InventoryItem)
        );
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
        let tmpItem = ItemHelper.getItem(itemtpl)[1];
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
        let skipThisItems = [
            "5448e53e4bdc2d60728b4567",
            "566168634bdc2d144c8b456c",
            "5795f317245977243854e041",
        ];
        let rootFolded =
      rootItem.upd &&
      rootItem.upd.Foldable &&
      rootItem.upd.Foldable.Folded === true;

        //The item itself is collapsible
        if (
            FoldableWeapon &&
      (FoldedSlot === undefined || FoldedSlot === "") &&
      rootFolded
        )
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
                        let itm = ItemHelper.getItem(item._tpl)[1];
                        let childFoldable = itm._props.Foldable;
                        let childFolded =
              item.upd &&
              item.upd.Foldable &&
              item.upd.Foldable.Folded === true;

                        if (
                            FoldableWeapon &&
              FoldedSlot === item.slotId &&
              (rootFolded || childFolded)
                        )
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
                            SizeUp =
                SizeUp < itm._props.ExtraSizeUp
                    ? itm._props.ExtraSizeUp
                    : SizeUp;
                            SizeDown =
                SizeDown < itm._props.ExtraSizeDown
                    ? itm._props.ExtraSizeDown
                    : SizeDown;
                            SizeLeft =
                SizeLeft < itm._props.ExtraSizeLeft
                    ? itm._props.ExtraSizeLeft
                    : SizeLeft;
                            SizeRight =
                SizeRight < itm._props.ExtraSizeRight
                    ? itm._props.ExtraSizeRight
                    : SizeRight;
                        }
                    }
                }

                toDo.splice(0, 1);
            }
        }

        return [
            outX + SizeLeft + SizeRight + ForcedLeft + ForcedRight,
            outY + SizeUp + SizeDown + ForcedUp + ForcedDown,
        ];
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
        return ItemHelper.findAndReturnChildrenByItems(
            pmcData.Inventory.items,
            itemID
        );
    }

    /* Get Player Stash Proper Size
   * input: null
   * output: [stashSizeWidth, stashSizeHeight]
   * */
    getPlayerStashSize(sessionID)
    {
    //this sets automaticly a stash size from items.json (its not added anywhere yet cause we still use base stash)
        let stashTPL = this.getStashType(sessionID);
        let stashX =
      DatabaseServer.tables.templates.items[stashTPL]._props.Grids[0]._props
          .cellsH !== 0
          ? DatabaseServer.tables.templates.items[stashTPL]._props.Grids[0]
              ._props.cellsH
          : 10;
        let stashY =
      DatabaseServer.tables.templates.items[stashTPL]._props.Grids[0]._props
          .cellsV !== 0
          ? DatabaseServer.tables.templates.items[stashTPL]._props.Grids[0]
              ._props.cellsV
          : 66;
        return [stashX, stashY];
    }

    /**
   * @param {itemTemplate[]} InventoryItem
   */
    getInventoryItemHash(InventoryItem)
    {
        let inventoryItemHash = {
            byItemId: {},
            byParentId: {},
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
            if (
                container.parentId === pmcData.Inventory.stash &&
        container.slotId === "hideout"
            )
            {
                return true;
            }

            container = pmcData.Inventory.items.find(
                (i) => i._id === container.parentId
            );

            if (!container)
            {
                break;
            }
        }

        return false;
    }
}
module.exports = new InventoryHelper();
