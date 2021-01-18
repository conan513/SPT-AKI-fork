/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class InventoryCallbacks
{
    constructor()
    {
        item_f.eventHandler.onEvent["Move"] = this.moveItem.bind(this);
        item_f.eventHandler.onEvent["Remove"] = this.removeItem.bind(this);
        item_f.eventHandler.onEvent["Split"] = this.splitItem.bind(this);
        item_f.eventHandler.onEvent["Merge"] = this.mergeItem.bind(this);
        item_f.eventHandler.onEvent["Transfer"] = this.transferItem.bind(this);
        item_f.eventHandler.onEvent["Swap"] = this.swapItem.bind(this);
        item_f.eventHandler.onEvent["Fold"] = this.foldItem.bind(this);
        item_f.eventHandler.onEvent["Toggle"] = this.toggleItem.bind(this);
        item_f.eventHandler.onEvent["Tag"] = this.tagItem.bind(this);
        item_f.eventHandler.onEvent["Bind"] = this.bindItem.bind(this);
        item_f.eventHandler.onEvent["Examine"] = this.examineItem.bind(this);
        item_f.eventHandler.onEvent["ReadEncyclopedia"] = this.readEncyclopedia.bind(this);
        item_f.eventHandler.onEvent["ApplyInventoryChanges"]  = this.sortInventory.bind(this);
    }

    moveItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.moveItem(pmcData, body, sessionID);
    }

    removeItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.discardItem(pmcData, body, sessionID);
    }

    splitItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.splitItem(pmcData, body, sessionID);
    }

    mergeItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.mergeItem(pmcData, body, sessionID);
    }

    transferItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.transferItem(pmcData, body, sessionID);
    }

    swapItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.swapItem(pmcData, body, sessionID);
    }

    foldItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.foldItem(pmcData, body, sessionID);
    }

    toggleItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.toggleItem(pmcData, body, sessionID);
    }

    tagItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.tagItem(pmcData, body, sessionID);
    }

    bindItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.bindItem(pmcData, body, sessionID);
    }

    examineItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.examineItem(pmcData, body, sessionID);
    }

    readEncyclopedia(pmcData, body, sessionID)
    {
        return inventory_f.controller.readEncyclopedia(pmcData, body, sessionID);
    }

    sortInventory(pmcData, body, sessionID)
    {
        return inventory_f.controller.sortInventory(pmcData, body, sessionID);
    }
}

module.exports = InventoryCallbacks;
