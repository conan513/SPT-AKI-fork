/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HealthConfig
{
    constructor()
    {
        this.healthMultipliers = {
            "death": 0.3,
            "blacked": 0.1
        };
        this.save = {
            "health": true,
            "effects": true
        };
    }
}

module.exports = new HealthConfig();
