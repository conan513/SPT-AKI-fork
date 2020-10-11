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
        item_f.router.routes["HideoutUpgrade"] = this.upgrade.bind(this);
        item_f.router.routes["HideoutUpgradeComplete"] = this.upgradeComplete.bind(this);
        item_f.router.routes["HideoutPutItemsInAreaSlots"] = this.putItemsInAreaSlots.bind(this);
        item_f.router.routes["HideoutTakeItemsFromAreaSlots"] = this.takeItemsFromAreaSlots.bind(this);
        item_f.router.routes["HideoutToggleArea"] = this.toggleArea.bind(this);
        item_f.router.routes["HideoutSingleProductionStart"] = this.singleProductionStart.bind(this);
        item_f.router.routes["HideoutScavCaseProductionStart"] = this.scavCaseProductionStart.bind(this);
        item_f.router.routes["HideoutContinuousProductionStart"] = this.continuousProductionStart.bind(this);
        item_f.router.routes["HideoutTakeProduction"] = this.takeProduction.bind(this);
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
}

module.exports.Callbacks = Callbacks;
