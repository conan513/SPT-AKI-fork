/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Config
{
    constructor()
    {
        // generation chance for the special bots
        // set to 0 to not allow generation of special bots
        // set to 100 to make only special bots spawn
        this.spawnChance = 1;
        
        // set to false to remove the special bot from the generation pool
        this.spawnableBots = {
            "senko": true,
            "ginja": true,
            "ereshkigal": true,
            "wafflelord": true,
            "digitalbarrito": true,
            "reider123": true,
            "terkoiz": true,
            "elitecheez": true,
            "cheekiestbreeki": true
        };
    }
}

module.exports.Config = Config;
