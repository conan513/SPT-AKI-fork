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
            "enabled": false,
            "threshold": 4000,
            "batchSize": 100,
            "presetChance": 10,
            "priceMin": 0.95,
            "priceMax": 1.2,
            "timeMin": 15,
            "timeMax": 120,
            "stackMin": 1,
            "stackMax": 100,
            "currencies": {
                "5449016a4bdc2d6f028b456f": 75,
                "5696686a4bdc2da3298b456a": 20,
                "569668774bdc2da2298b4568": 5
            }
        }
        this.static = {
            "price": 1,
            "time": 1440,
            "stack": 999999999,
            "currency": "5449016a4bdc2d6f028b456f"
        }
    }
}

module.exports.Config = Config;
