/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const RepairController = require("../controllers/RepairController.js");

class RepairCallbacks
{
    static repair(pmcData, body, sessionID)
    {
        return RepairController.repair(pmcData, body, sessionID);
    }
}

module.exports = RepairCallbacks;
