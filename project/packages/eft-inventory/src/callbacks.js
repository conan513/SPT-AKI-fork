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
        item_f.router.routes["Move"] = this.moveItem.bind(this);
        item_f.router.routes["Remove"] = this.removeItem.bind(this);
        item_f.router.routes["Split"] = this.splitItem.bind(this);
        item_f.router.routes["Merge"] = this.mergeItem.bind(this);
        item_f.router.routes["Transfer"] = this.transferItem.bind(this);
        item_f.router.routes["Swap"] = this.swapItem.bind(this);
        item_f.router.routes["Fold"] = this.foldItem.bind(this);
        item_f.router.routes["Toggle"] = this.toggleItem.bind(this);
        item_f.router.routes["Tag"] = this.tagItem.bind(this);
        item_f.router.routes["Bind"] = this.bindItem.bind(this);
        item_f.router.routes["Examine"] = this.examineItem.bind(this);
        item_f.router.routes["ReadEncyclopedia"] = this.readEncyclopedia.bind(this);
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
}

module.exports.Callbacks = Callbacks;
