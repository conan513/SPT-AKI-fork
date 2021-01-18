/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class RepairCallbacks
{
    constructor()
    {
        item_f.eventHandler.onEvent["Repair"] = this.repair.bind(this);
    }

    repair(pmcData, body, sessionID)
    {
        return repair_f.controller.repair(pmcData, body, sessionID);
    }
}

module.exports = RepairCallbacks;
