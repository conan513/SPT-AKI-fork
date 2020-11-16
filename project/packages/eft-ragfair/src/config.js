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
        this.priceMultiplier = 1;
        this.instantSellThreshold = 95; // Percentage of item price at which the offer instantly sells
    }
}

module.exports.Config = Config;
