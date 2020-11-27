/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Controller
{
    load()
    {
        this.setChristmasEvent();
        this.addScavSuitsToFence();
        this.addMoreLootChance();
        this.addPmcSpawns();
    }

    setChristmasEvent()
    {
        database_f.server.tables.globals.config.EventType = [
            "Christmas"
        ];
    }

    addScavSuitsToFence()
    {
        const json = common_f.vfs.readFile("packages/ext-additions/db/traders/579dc571d53a0658a154fbec/suits.json");
        database_f.server.tables.traders["579dc571d53a0658a154fbec"].suits = common_f.json.deserialize(json);
    }

    addMoreLootChance()
    {
        database_f.server.tables.globals.config.GlobalLootChanceModifier = 5;
    }

    addPmcSpawns()
    {
        const pmcSettings = additions_f.config.pmcSpawn;

        if (!pmcSettings.enabled)
        {
            return;
        }

        for (const locationName in database_f.server.tables.locations)
        {
            if (!pmcSettings.locations[locationName])
            {
                continue;
            }

            let location = database_f.server.tables.locations[locationName].base;
    
            const maxSize = 4;                              // boss + followers
            const initialDelay = 5;                         // seconds
            const maxTime = location.escape_time_limit - 5; // minutes
            const count = Math.round(location.MaxPlayers / maxSize);

            for (let i = 0; i < count; i++)
            {
                location.BossLocationSpawn.push({
                    "BossName": "bossTest",
                    "BossChance": pmcSettings.spawnChance,
                    "BossZone": pmcSettings.locations[locationName],
                    "BossPlayer": false,
                    "BossDifficult": "hard",
                    "BossEscortType": "followerTest",
                    "BossEscortDifficult": "hard",
                    "BossEscortAmount": `${maxSize - 1}`,
                    "Time": initialDelay + Math.round(maxTime / count) * i,
                    "TriggerId": "",
                    "TriggerName": "none",
                    "Delay": 0
                });
            }

            database_f.server.tables.locations[locationName].base = location;
        }
    }
}

module.exports.Controller = Controller;
