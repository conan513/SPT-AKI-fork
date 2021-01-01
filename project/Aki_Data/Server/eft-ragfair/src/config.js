/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

"use strict";

class Config
{
    constructor()
    {
        this.player = {
            "sellChance": 25,
            "sellTimeHrs": 12,
            "enableFees": false
        }
        this.dynamic = {
            "enabled": true,
            "threshold": 4000,
            "batchSize": 100,
            "presetChance": 10,
            "priceMin": 0.95,
            "priceMax": 1.5,
            "timeMin": 15,
            "timeMax": 120,
            "stackMin": 1,
            "stackMax": 1000
        }
        this.static = {
            "timeMax": 0,
            "pricePerc": 1,
            "stackSize": 999999999
        }
    }
}

module.exports.Config = Config;
