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
        this.components = {
            "christmas": true,
            "tweakedLootChance": true,
            "fenceSuits": true,
            "pmcGroup": true
        };
        this.pmcGroup = {
            "chance": 35,
            "time": {
                "init": 5,
                "exit": 300
            },
            "size": {
                "min": 1,
                "max": 4
            },
            "difficulty": {
                "boss": "hard",
                "follower": "hard"
            },
            "type": {
                "boss": "bossTest",
                "follower": "followerTest"
            },
            "locations": {
                "bigmap": "ZoneBrige,ZoneCrossRoad,ZoneFactorySide,ZoneOldAZS,ZoneBlock,Post,ZoneTankSquare,ZoneCustoms",
                "factory4_day": "BotZone",
                "factory4_night": "BotZone",
                "interchange": "ZoneIDEA,ZoneRoad,ZoneCenter,ZoneCenterBot,ZoneOLI,ZoneOLIPark,ZoneGoshan,ZonePowerStation,ZoneTrucks,ZoneIDEAPark",
                "laboratory": "BotZoneMain",
                "rezervbase": "ZoneRailStrorage,ZonePTOR1,ZonePTOR2,ZoneBarrack,ZoneBunkerStorage,ZoneSubStorage",
                "shoreline": "ZoneSanatorium,ZonePassFar,ZonePassClose,ZoneTunnel,ZoneStartVillage,ZoneBunker",
                "woods": "ZoneRedHouse,ZoneHighRocks,ZoneWoodCutter,ZoneHouse,ZoneBigRocks,ZoneRoad,ZoneMiniHouse"
            }
        };
    }
}

module.exports.Config = Config;
