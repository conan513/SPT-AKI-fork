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
        this.priceMultiplier = 0.3;
        this.returnChance = 75;
        this.runInterval = 10 * 60;
    }
}

module.exports.Config = Config;
