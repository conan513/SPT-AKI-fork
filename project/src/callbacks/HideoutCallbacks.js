/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HideoutCallbacks
{
    static upgrade(pmcData, body, sessionID)
    {
        return hideout_f.controller.upgrade(pmcData, body, sessionID);
    }

    static upgradeComplete(pmcData, body, sessionID)
    {
        return hideout_f.controller.upgradeComplete(pmcData, body, sessionID);
    }

    static putItemsInAreaSlots(pmcData, body, sessionID)
    {
        return hideout_f.controller.putItemsInAreaSlots(pmcData, body, sessionID);
    }

    static takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        return hideout_f.controller.takeItemsFromAreaSlots(pmcData, body, sessionID);
    }

    static toggleArea(pmcData, body, sessionID)
    {
        return hideout_f.controller.toggleArea(pmcData, body, sessionID);
    }

    static singleProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.controller.singleProductionStart(pmcData, body, sessionID);
    }

    static scavCaseProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.controller.scavCaseProductionStart(pmcData, body, sessionID);
    }

    static continuousProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.controller.continuousProductionStart(pmcData, body, sessionID);
    }

    static takeProduction(pmcData, body, sessionID)
    {
        return hideout_f.controller.takeProduction(pmcData, body, sessionID);
    }

    static update(timeSinceLastRun)
    {
        if (timeSinceLastRun > hideout_f.config.runInterval)
        {
            hideout_f.controller.update();
            return true;
        }

        return false;
    }
}

module.exports = HideoutCallbacks;
