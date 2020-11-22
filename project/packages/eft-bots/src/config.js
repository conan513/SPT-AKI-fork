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
            "followerTest": 30,
            "bossTest": 30,
            "assaultGroup": 30,
            "playerScav": 30
        };
        this.pmcSpawn = {
            "enabled": true,
            "spawnChance": 35,
            "usecChance": 50,
            "locations": {
                "bigmap": [
                    "ZoneBrige",
                    "ZoneCrossRoad",
                    "ZoneFactorySide",
                    "ZoneOldAZS",
                    "ZoneBlock",
                    "Post",
                    "ZoneTankSquare",
                    "ZoneCustoms"
                ],
                "factory4_day": [
                    "BotZone"
                ],
                "factory4_night": [
                    "BotZone"
                ],
                "interchange": [
                    "ZoneIDEA",
                    "ZoneRoad",
                    "ZoneCenter",
                    "ZoneCenterBot",
                    "ZoneOLI",
                    "ZoneOLIPark",
                    "ZoneGoshan",
                    "ZonePowerStation",
                    "ZoneTrucks",
                    "ZoneIDEAPark"
                ],
                "laboratory": [
                    "BotZoneMain"
                ],
                "rezervbase": [
                    "ZoneRailStrorage",
                    "ZonePTOR1",
                    "ZonePTOR2",
                    "ZoneBarrack",
                    "ZoneBunkerStorage",
                    "ZoneSubStorage"
                ],
                "shoreline": [
                    "ZoneSanatorium",
                    "ZonePassFar",
                    "ZonePassClose",
                    "ZoneTunnel",
                    "ZoneStartVillage",
                    "ZoneBunker"
                ],
                "woods": [
                    "ZoneRedHouse",
                    "ZoneHighRocks",
                    "ZoneWoodCutter",
                    "ZoneHouse",
                    "ZoneBigRocks",
                    "ZoneRoad",
                    "ZoneMiniHouse"
                ]
            }
        };
    }
}

module.exports.Config = Config;
