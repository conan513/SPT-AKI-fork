/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

"use strict";

class Controller
{
    getBotLimit(type)
    {
        return bots_f.config.limits[(type === "cursedAssault" || type === "assaultGroup") ? "assault" : type];
    }

    getBotDifficulty(type, difficulty)
    {
        switch (type)
        {
            // requested difficulty shared among bots
            case "core":
                return database_f.server.tables.bots.core;

            // don't replace type
            default:
                break;
        }

        return database_f.server.tables.bots.types[type].difficulty[difficulty];
    }

    generateId(bot)
    {
        const botId = common_f.hash.generate();

        bot._id = botId;
        bot.aid = botId;
        return bot;
    }

    generateBot(bot, role)
    {
        // generate bot
        const node = database_f.server.tables.bots.types[role.toLowerCase()];
        const levelResult = this.generateRandomLevel(node.experience.level.min, node.experience.level.max);

        bot.Info.Nickname = common_f.random.getArrayValue(node.names);
        bot.Info.experience = levelResult.exp;
        bot.Info.Level = levelResult.level;
        bot.Info.Settings.Experience = common_f.random.getInt(node.experience.reward.min, node.experience.reward.max);
        bot.Info.Voice = common_f.random.getArrayValue(node.appearance.voice);
        bot.Health = this.generateHealth(node.health);
        bot.Customization.Head = common_f.random.getArrayValue(node.appearance.head);
        bot.Customization.Body = common_f.random.getArrayValue(node.appearance.body);
        bot.Customization.Feet = common_f.random.getArrayValue(node.appearance.feet);
        bot.Customization.Hands = common_f.random.getArrayValue(node.appearance.hands);
        bot.Inventory = bots_f.generator.generateInventory(node.inventory, node.chances, node.generation);

        // add dogtag to PMC's
        if (role === "usec" || role === "bear")
        {
            bot = this.generateDogtag(bot);
        }

        // generate new bot ID
        bot = this.generateId(bot);

        // generate new inventory ID
        bot = helpfunc_f.helpFunctions.generateInventoryID(bot);

        return bot;
    }

    generate(info)
    {
        let output = [];

        for (const condition of info.conditions)
        {
            for (let i = 0; i < condition.Limit; i++)
            {
                const pmcSide = (common_f.random.getInt(0, 99) < bots_f.config.pmc.isUsec) ? "Usec" : "Bear";
                const role = condition.Role;
                const isPmc = (role in bots_f.config.pmc.types && common_f.random.getInt(0, 99) < bots_f.config.pmc.types[role]);
                let bot = common_f.json.clone(database_f.server.tables.bots.base);

                bot.Info.Settings.BotDifficulty = condition.Difficulty;
                bot.Info.Settings.Role = role;
                bot.Info.Side = (isPmc) ? pmcSide : "Savage";
                bot = this.generateBot(bot, (isPmc) ? pmcSide.toLowerCase() : role.toLowerCase());

                output.unshift(bot);
            }
        }

        return output;
    }

    generateRandomLevel(min, max)
    {
        const expTable = database_f.server.tables.globals.config.exp.level.exp_table;
        const maxLevel = Math.min(max, expTable.length);

        // Get random level based on the exp table.
        let exp = 0;
        let level = common_f.random.getInt(min, maxLevel);

        for (let i = 0; i < level; i++)
        {
            exp += expTable[i].exp;
        }

        // Sprinkle in some random exp within the level, unless we are at max level.
        if (level < expTable.length - 1)
        {
            exp += common_f.random.getInt(0, expTable[level].exp - 1);
        }

        return {level, exp};
    }

    /** Converts health object to the required format */
    generateHealth(healthObj)
    {
        return {
            "Hydration": {
                "Current": common_f.random.getInt(healthObj.Hydration.min, healthObj.Hydration.max),
                "Maximum": healthObj.Hydration.max
            },
            "Energy": {
                "Current": common_f.random.getInt(healthObj.Energy.min, healthObj.Energy.max),
                "Maximum": healthObj.Energy.max
            },
            "BodyParts": {
                "Head": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.Head.min, healthObj.BodyParts.Head.max),
                        "Maximum": healthObj.BodyParts.Head.max
                    }
                },
                "Chest": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.Chest.min, healthObj.BodyParts.Chest.max),
                        "Maximum": healthObj.BodyParts.Chest.max
                    }
                },
                "Stomach": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.Stomach.min, healthObj.BodyParts.Stomach.max),
                        "Maximum": healthObj.BodyParts.Stomach.max
                    }
                },
                "LeftArm": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.LeftArm.min, healthObj.BodyParts.LeftArm.max),
                        "Maximum": healthObj.BodyParts.LeftArm.max
                    }
                },
                "RightArm": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.RightArm.min, healthObj.BodyParts.RightArm.max),
                        "Maximum": healthObj.BodyParts.RightArm.max
                    }
                },
                "LeftLeg": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.LeftLeg.min, healthObj.BodyParts.LeftLeg.max),
                        "Maximum": healthObj.BodyParts.LeftLeg.max
                    }
                },
                "RightLeg": {
                    "Health": {
                        "Current": common_f.random.getInt(healthObj.BodyParts.RightLeg.min, healthObj.BodyParts.RightLeg.max),
                        "Maximum": healthObj.BodyParts.RightLeg.max
                    }
                }
            }
        };
    }

    generateDogtag(bot)
    {
        bot.Inventory.items.push({
            _id: common_f.hash.generate(),
            _tpl: ((bot.Info.Side === "Usec") ? "59f32c3b86f77472a31742f0" : "59f32bb586f774757e1e8442"),
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            upd: {
                "Dogtag": {
                    "AccountId": bot.aid,
                    "ProfileId": bot._id,
                    "Nickname": bot.Info.Nickname,
                    "Side": bot.Info.Side,
                    "Level": bot.Info.Level,
                    "Time": (new Date().toISOString()),
                    "Status": "Killed by ",
                    "KillerAccountId": "Unknown",
                    "KillerProfileId": "Unknown",
                    "KillerName": "Unknown",
                    "WeaponName": "Unknown"
                }
            }
        });

        return bot;
    }
}

module.exports.Controller = Controller;
