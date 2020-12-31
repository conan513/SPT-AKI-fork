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
        this.sellChance = 25;
        this.sellTimeHrs = 12;
        this.enableFees = false;
    }
}

module.exports.Config = Config;
