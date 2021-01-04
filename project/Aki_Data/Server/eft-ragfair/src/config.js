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
        this.static = {
            "unknown": false,
            "traders": {
                "54cb50c76803fa8b248b4571": true,
                "54cb57776803fa99248b456e": true,
                "579dc571d53a0658a154fbec": true,
                "58330581ace78e27b8b10cee": true,
                "5935c25fb3acc3127c3d8cd9": true,
                "5a7c2eca46aef81a7ca2145d": true,
                "5ac3b934156ae10c4430e83c": true,
                "5c0647fdd443bc2504c2d371": true
            }
        };
        this.dynamic = {
            "enabled": true,
            "threshold": 4000,
            "batchSize": 100,
            "priceMin": 0.95,
            "priceMax": 1.2,
            "timeEndMin": 15,
            "timeEndMax": 120,
            "conditionMin": 0.1,
            "conditionMax": 0.95,
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
