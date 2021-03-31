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
    static moveItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.moveItem(pmcData, body, sessionID);
    }

    static removeItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.discardItem(pmcData, body, sessionID);
    }

    static splitItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.splitItem(pmcData, body, sessionID);
    }

    static mergeItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.mergeItem(pmcData, body, sessionID);
    }

    static transferItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.transferItem(pmcData, body, sessionID);
    }

    static swapItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.swapItem(pmcData, body, sessionID);
    }

    static foldItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.foldItem(pmcData, body, sessionID);
    }

    static toggleItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.toggleItem(pmcData, body, sessionID);
    }

    static tagItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.tagItem(pmcData, body, sessionID);
    }

    static bindItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.bindItem(pmcData, body, sessionID);
    }

    static examineItem(pmcData, body, sessionID)
    {
        return inventory_f.controller.examineItem(pmcData, body, sessionID);
    }

    static readEncyclopedia(pmcData, body, sessionID)
    {
        return inventory_f.controller.readEncyclopedia(pmcData, body, sessionID);
    }

    static sortInventory(pmcData, body, sessionID)
    {
        return inventory_f.controller.sortInventory(pmcData, body, sessionID);
    }
}

module.exports = InventoryCallbacks;
