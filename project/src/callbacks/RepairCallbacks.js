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
    static repair(pmcData, body, sessionID)
    {
        return repair_f.controller.repair(pmcData, body, sessionID);
    }
}

module.exports = RepairCallbacks;
