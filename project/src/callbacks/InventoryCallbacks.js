/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const InventoryController = require("../controllers/InventoryController.js");

class InventoryCallbacks
{
    static moveItem(pmcData, body, sessionID)
    {
        return InventoryController.moveItem(pmcData, body, sessionID);
    }

    static removeItem(pmcData, body, sessionID)
    {
        return InventoryController.discardItem(pmcData, body, sessionID);
    }

    static splitItem(pmcData, body, sessionID)
    {
        return InventoryController.splitItem(pmcData, body, sessionID);
    }

    static mergeItem(pmcData, body, sessionID)
    {
        return InventoryController.mergeItem(pmcData, body, sessionID);
    }

    static transferItem(pmcData, body, sessionID)
    {
        return InventoryController.transferItem(pmcData, body, sessionID);
    }

    static swapItem(pmcData, body, sessionID)
    {
        return InventoryController.swapItem(pmcData, body, sessionID);
    }

    static foldItem(pmcData, body, sessionID)
    {
        return InventoryController.foldItem(pmcData, body, sessionID);
    }

    static toggleItem(pmcData, body, sessionID)
    {
        return InventoryController.toggleItem(pmcData, body, sessionID);
    }

    static tagItem(pmcData, body, sessionID)
    {
        return InventoryController.tagItem(pmcData, body, sessionID);
    }

    static bindItem(pmcData, body, sessionID)
    {
        return InventoryController.bindItem(pmcData, body, sessionID);
    }

    static examineItem(pmcData, body, sessionID)
    {
        return InventoryController.examineItem(pmcData, body, sessionID);
    }

    static readEncyclopedia(pmcData, body, sessionID)
    {
        return InventoryController.readEncyclopedia(pmcData, body, sessionID);
    }

    static sortInventory(pmcData, body, sessionID)
    {
        return InventoryController.sortInventory(pmcData, body, sessionID);
    }
}

module.exports = InventoryCallbacks;
