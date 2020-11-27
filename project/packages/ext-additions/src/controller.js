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
        const pmcSettings = additions_f.config.pmcGroup;

        if (!pmcSettings.enabled)
        {
            return;
        }

        // set generator limits
        bots_f.config.limits.followerTest = pmcSettings.size - 1;

        // add group spawns to locations
        for (const locationName in database_f.server.tables.locations)
        {
            if (!pmcSettings.locations[locationName])
            {
                continue;
            }

            let location = database_f.server.tables.locations[locationName].base;
            const initialDelay = 5;                             // seconds
            const maxTime = location.escape_time_limit - 5;     // minutes
            const count = Math.round(location.MaxPlayers / pmcSettings.size);

            for (let i = 0; i < count; i++)
            {
                let output = {
                    "BossName": "bossTest",
                    "BossChance": pmcSettings.chance,
                    "BossZone": pmcSettings.locations[locationName],
                    "BossPlayer": false,
                    "BossDifficult": "normal",
                    "BossEscortType": "followerTest",
                    "BossEscortDifficult": "normal",
                    "BossEscortAmount": bots_f.config.limits.followerTest,
                    "Time": initialDelay + Math.round(maxTime / count) * i
                }

                if (locationName === "laboratory")
                {
                    output = Object.assign(output, {
                        "TriggerId": "",
                        "TriggerName": "none",
                        "Delay": 0
                    });
                }

                location.BossLocationSpawn.push(output);
            }

            database_f.server.tables.locations[locationName].base = location;
            common_f.vfs.writeFile(`./${locationName}.json`, common_f.json.serialize(location));
        }
    }
}

module.exports.Controller = Controller;
