/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        core_f.packager.onUpdate["hideout"] = this.update.bind(this);
        item_f.eventHandler.onEvent["HideoutUpgrade"] = this.upgrade.bind(this);
        item_f.eventHandler.onEvent["HideoutUpgradeComplete"] = this.upgradeComplete.bind(this);
        item_f.eventHandler.onEvent["HideoutPutItemsInAreaSlots"] = this.putItemsInAreaSlots.bind(this);
        item_f.eventHandler.onEvent["HideoutTakeItemsFromAreaSlots"] = this.takeItemsFromAreaSlots.bind(this);
        item_f.eventHandler.onEvent["HideoutToggleArea"] = this.toggleArea.bind(this);
        item_f.eventHandler.onEvent["HideoutSingleProductionStart"] = this.singleProductionStart.bind(this);
        item_f.eventHandler.onEvent["HideoutScavCaseProductionStart"] = this.scavCaseProductionStart.bind(this);
        item_f.eventHandler.onEvent["HideoutContinuousProductionStart"] = this.continuousProductionStart.bind(this);
        item_f.eventHandler.onEvent["HideoutTakeProduction"] = this.takeProduction.bind(this);
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

    update()
    {
        hideout_f.controller.update();
    }
}

module.exports.Callbacks = Callbacks;
