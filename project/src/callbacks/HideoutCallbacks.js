"use strict";

require("../Lib.js");

class HideoutCallbacks
{
    static upgrade(pmcData, body, sessionID)
    {
        return HideoutCallbacks.upgrade(pmcData, body, sessionID);
    }

    static upgradeComplete(pmcData, body, sessionID)
    {
        return HideoutCallbacks.upgradeComplete(pmcData, body, sessionID);
    }

    static putItemsInAreaSlots(pmcData, body, sessionID)
    {
        return HideoutCallbacks.putItemsInAreaSlots(pmcData, body, sessionID);
    }

    static takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        return HideoutCallbacks.takeItemsFromAreaSlots(pmcData, body, sessionID);
    }

    static toggleArea(pmcData, body, sessionID)
    {
        return HideoutCallbacks.toggleArea(pmcData, body, sessionID);
    }

    static singleProductionStart(pmcData, body, sessionID)
    {
        return HideoutCallbacks.singleProductionStart(pmcData, body, sessionID);
    }

    static scavCaseProductionStart(pmcData, body, sessionID)
    {
        return HideoutCallbacks.scavCaseProductionStart(pmcData, body, sessionID);
    }

    static continuousProductionStart(pmcData, body, sessionID)
    {
        return HideoutCallbacks.continuousProductionStart(pmcData, body, sessionID);
    }

    static takeProduction(pmcData, body, sessionID)
    {
        return HideoutCallbacks.takeProduction(pmcData, body, sessionID);
    }

    static update(timeSinceLastRun)
    {
        if (timeSinceLastRun > HideoutConfig.runInterval)
        {
            HideoutCallbacks.update();
            return true;
        }

        return false;
    }
}

module.exports = HideoutCallbacks;
