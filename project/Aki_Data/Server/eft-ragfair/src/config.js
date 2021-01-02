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
        };
        this.traders = {
            "enabled": true
        };
        this.dynamic = {
            "enabled": true,
            "threshold": 4000,
            "batchSize": 100,
            "presetChance": 10,
            "priceMin": 0.95,
            "priceMax": 1.2,
            "timeEndMin": 15,
            "timeEndMax": 120,
            "stackMin": 1,
            "stackMax": 100,
            "currencies": {
                "5449016a4bdc2d6f028b456f": 75,
                "5696686a4bdc2da3298b456a": 23,
                "569668774bdc2da2298b4568": 2
            }
        };
    }
}

module.exports.Config = Config;
