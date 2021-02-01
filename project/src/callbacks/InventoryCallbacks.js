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

module.exports = new InventoryCallbacks();
