/* BotConfig.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class BotConfig
{
    constructor()
    {
        this.limits = {
            "assault": 30,
            "assaultGroup": 30,
            "cursedAssault": 30,
            "marksman": 30,
            "pmcBot": 30,
            "bossTest": 30,
            "bossBully": 30,
            "bossGluhar": 30,
            "bossKilla": 30,
            "bossKojaniy": 30,
            "bossSanitar": 30,
            "followerTest": 30,
            "followerBully": 30,
            "followerGluharAssault": 30,
            "followerGluharScout": 30,
            "followerGluharSecurity": 30,
            "followerGluharSnipe": 30,
            "followerKojaniy": 30,
            "followerSanitar": 30,
            "playerScav": 30,
            "sectantWarrior": 30,
            "sectantPriest": 30,
            "test": 30
        };
        this.pmc = {
            "isUsec": 50,
            "types": {
                "assaultGroup": 100
            }
        };
    }
}

module.exports = BotConfig;
