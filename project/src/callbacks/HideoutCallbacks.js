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
    constructor()
    {
        core_f.packager.onUpdate["hideout"] = this.update.bind(this);
        item_f.eventHandler.addEvent("HideoutUpgrade", "Aki", this.upgrade.bind(this));
        item_f.eventHandler.addEvent("HideoutUpgradeComplete", "Aki", this.upgradeComplete.bind(this));
        item_f.eventHandler.addEvent("HideoutPutItemsInAreaSlots", "Aki", this.putItemsInAreaSlots.bind(this));
        item_f.eventHandler.addEvent("HideoutTakeItemsFromAreaSlots", "Aki", this.takeItemsFromAreaSlots.bind(this));
        item_f.eventHandler.addEvent("HideoutToggleArea", "Aki", this.toggleArea.bind(this));
        item_f.eventHandler.addEvent("HideoutSingleProductionStart", "Aki", this.singleProductionStart.bind(this));
        item_f.eventHandler.addEvent("HideoutScavCaseProductionStart", "Aki", this.scavCaseProductionStart.bind(this));
        item_f.eventHandler.addEvent("HideoutContinuousProductionStart", "Aki", this.continuousProductionStart.bind(this));
        item_f.eventHandler.addEvent("HideoutTakeProduction", "Aki", this.takeProduction.bind(this));
    }

    upgrade(pmcData, body, sessionID)
    {
        return hideout_f.controller.upgrade(pmcData, body, sessionID);
    }

    upgradeComplete(pmcData, body, sessionID)
    {
        return hideout_f.controller.upgradeComplete(pmcData, body, sessionID);
    }

    putItemsInAreaSlots(pmcData, body, sessionID)
    {
        return hideout_f.controller.putItemsInAreaSlots(pmcData, body, sessionID);
    }

    takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        return hideout_f.controller.takeItemsFromAreaSlots(pmcData, body, sessionID);
    }

    toggleArea(pmcData, body, sessionID)
    {
        return hideout_f.controller.toggleArea(pmcData, body, sessionID);
    }

    singleProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.controller.singleProductionStart(pmcData, body, sessionID);
    }

    scavCaseProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.controller.scavCaseProductionStart(pmcData, body, sessionID);
    }

    continuousProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.controller.continuousProductionStart(pmcData, body, sessionID);
    }

    takeProduction(pmcData, body, sessionID)
    {
        return hideout_f.controller.takeProduction(pmcData, body, sessionID);
    }

    update(timeSinceLastRun)
    {
        if (timeSinceLastRun > hideout_f.config.runInterval)
        {
            hideout_f.controller.update();
            return true;
        }
        return false;
    }

}

module.exports = new HideoutCallbacks();
