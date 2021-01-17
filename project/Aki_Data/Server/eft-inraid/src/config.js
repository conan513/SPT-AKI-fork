/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class InraidConfig
{
    constructor()
    {
        this.MIAOnRaidEnd = false;
        this.raidMenuSettings = {
            "aiAmount": "AsOnline",
            "aiDifficulty": "AsOnline",
            "bossEnabled": true,
            "scavWars": false,
            "taggedAndCursed": false
        };
        this.save = {
            "loot": true,
            "durability": true
        };
    }
}

module.exports.InraidConfig = InraidConfig;
