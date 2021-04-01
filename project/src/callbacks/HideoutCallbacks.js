/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HideoutConfig = require("../configs/Hideoutconfig.js");
const HideoutController = require("../controllers/HideoutController.js");

class HideoutCallbacks
{
    static upgrade(pmcData, body, sessionID)
    {
        return InventoryController.upgrade(pmcData, body, sessionID);
    }

    static upgradeComplete(pmcData, body, sessionID)
    {
        return InventoryController.upgradeComplete(pmcData, body, sessionID);
    }

    static putItemsInAreaSlots(pmcData, body, sessionID)
    {
        return InventoryController.putItemsInAreaSlots(pmcData, body, sessionID);
    }

    static takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        return InventoryController.takeItemsFromAreaSlots(pmcData, body, sessionID);
    }

    static toggleArea(pmcData, body, sessionID)
    {
        return InventoryController.toggleArea(pmcData, body, sessionID);
    }

    static singleProductionStart(pmcData, body, sessionID)
    {
        return InventoryController.singleProductionStart(pmcData, body, sessionID);
    }

    static scavCaseProductionStart(pmcData, body, sessionID)
    {
        return InventoryController.scavCaseProductionStart(pmcData, body, sessionID);
    }

    static continuousProductionStart(pmcData, body, sessionID)
    {
        return InventoryController.continuousProductionStart(pmcData, body, sessionID);
    }

    static takeProduction(pmcData, body, sessionID)
    {
        return InventoryController.takeProduction(pmcData, body, sessionID);
    }

    static update(timeSinceLastRun)
    {
        if (timeSinceLastRun > HideoutConfig.runInterval)
        {
            InventoryController.update();
            return true;
        }

        return false;
    }
}

module.exports = HideoutCallbacks;
