/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class LocationConfig
{
    constructor()
    {
        this.allowLootOverlay = false;
        this.limits = {
            "bigmap": 1000,
            "develop": 30,
            "factory4_day": 100,
            "factory4_night": 100,
            "interchange": 2000,
            "laboratory": 1000,
            "rezervbase": 3000,
            "shoreline": 1000,
            "woods": 200,
            "hideout": 0,
            "lighthouse": 0,
            "privatearea": 0,
            "suburbs": 0,
            "tarkovstreets": 0,
            "terminal": 0,
            "town": 0
        };
    }
}

module.exports = new LocationConfig();
