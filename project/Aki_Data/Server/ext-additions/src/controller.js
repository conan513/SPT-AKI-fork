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
        this.addGL40Mastery();
        this.addPmcSpawns();
    }

    setChristmasEvent()
    {
        database_f.server.tables.globals.config.EventType = (additions_f.config.components.christmas) ? ["Christmas"] : ["None"];
    }

    addScavSuitsToFence()
    {
        if (additions_f.config.components.fenceSuits)
        {
            const json = common_f.vfs.readFile("Aki_Data/Server/ext-additions/db/traders/579dc571d53a0658a154fbec/suits.json");
            database_f.server.tables.traders["579dc571d53a0658a154fbec"].suits = common_f.json.deserialize(json);
            database_f.server.tables.traders["579dc571d53a0658a154fbec"].base.customization_seller = true;
        }
    }

    addMoreLootChance()
    {
        if (additions_f.config.components.tweakedLootChance)
        {
            database_f.server.tables.globals.config.GlobalLootChanceModifier = 5;
        }
    }

    addGL40Mastery()
    {
        if (additions_f.config.components.GL40Mastery)
        {
            database_f.server.tables.globals.config.Mastering.push(
                {
                    "Name": "GL40",
                    "Templates": [
                        "5e81ebcd8e146c7080625e15"
                    ],
                    "Level2": 1000,
                    "Level3": 3000
                }
            )
        }
    }

    addPmcSpawns()
    {
        const config = additions_f.config.pmcGroup;

        if (!additions_f.config.components.pmcGroup)
        {
            return;
        }

        // add group spawns to locations
        for (const locationName in database_f.server.tables.locations)
        {
            if (!config.locations[locationName])
            {
                continue;
            }

            let location = database_f.server.tables.locations[locationName].base;
            const maxTime = location.escape_time_limit - Math.round(config.time.exit + (config.time.init / 60));
            const count = Math.round(location.MaxPlayers / config.size.min);

            for (let i = 0; i < count; i++)
            {
                const followers = common_f.random.getInt(config.size.min, config.size.max) - 1;
                const time = config.time.init + (Math.round(maxTime * 60 / count) * i);

                let output = {
                    "BossName": config.type.boss,
                    "BossChance": config.chance,
                    "BossZone": config.locations[locationName],
                    "BossPlayer": false,
                    "BossDifficult": config.difficulty.boss,
                    "BossEscortType": config.type.follower,
                    "BossEscortDifficult": config.difficulty.follower,
                    "BossEscortAmount": followers.toString(),
                    "Time": time
                };

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
        }
    }
}

module.exports.Controller = Controller;
