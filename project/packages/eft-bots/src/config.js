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
        this.limits = {
            "assault": 30,
            "cursedAssault": 30,
            "marksman": 30,
            "pmcBot": 30,
            "bossBully": 30,
            "bossGluhar": 30,
            "bossKilla": 30,
            "bossKojaniy": 30,
            "bossSanitar": 30,
            "followerBully": 30,
            "followerGluharAssault": 30,
            "followerGluharScout": 30,
            "followerGluharSecurity": 30,
            "followerGluharSnipe": 30,
            "followerKojaniy": 30,
            "followerSanitar": 30,
            "test": 30,
            "followerTest": 3,
            "bossTest": 1,
            "assaultGroup": 30,
            "playerScav": 30
        };
        this.pmc = {
            "isUsec": 50,
            "types": {
                "followerTest": 100,
                "bossTest": 100,
                "assault": 35,
                "pmcBot": 35
            }
        };
    }
}

module.exports.Config = Config;
