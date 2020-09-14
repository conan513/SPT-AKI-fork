"use strict";

class BotController
{
    constructor()
    {
        this.limitSettings = {};
        this.pmcSettings = {};
    }

    generateBot(bot, role, sessionID)
    {
        let type = (role === "cursedAssault") ? "assault" : role;
        let pmcSettings = bots_f.botConfig.pmcSpawn;

        // chance to spawn simulated PMC AIs
        if ((type === "assault" || type === "pmcBot") && pmcSettings.enabled)
        {
            let spawnChance = utility.getRandomInt(0, 99);
            let sideChance = utility.getRandomInt(0, 99);

            if (spawnChance < pmcSettings.spawnChance)
            {
                if (sideChance < pmcSettings.usecChance)
                {
                    bot.Info.Side = "Usec";
                    type = "usec";
                }
                else
                {
                    bot.Info.Side = "Bear";
                    type = "bear";
                }

                bot.Info.Level = utility.getRandomInt(1, 40);
            }
        }

        // we don't want player scav to be generated as PMC
        if (role === "playerScav")
        {
            type = "assault";
        }

        // generate bot
        let node = database_f.database.tables.bots.type[type.toLowerCase()];

        bot.Info.Settings.Role = role;
        bot.Info.Nickname = utility.getRandomValue(node.names);
        bot.Info.experience = helpfunc_f.getRandomExperience();
        bot.Info.Level = helpfunc_f.calculateLevel(bot);
        bot.Info.Settings.Experience = utility.getRandomValue(node.experience);
        bot.Info.Voice = utility.getRandomValue(node.appearance.voice);
        bot.Health = utility.getRandomValue(node.health);
        bot.Customization.Head = utility.getRandomValue(node.appearance.head);
        bot.Customization.Body = utility.getRandomValue(node.appearance.body);
        bot.Customization.Feet = utility.getRandomValue(node.appearance.feet);
        bot.Customization.Hands = utility.getRandomValue(node.appearance.hands);
        bot.Inventory = utility.getRandomValue(node.inventory);

        // add dogtag to PMC's
        if (type === "usec" || type === "bear")
        {
            bot = helpfunc_f.addDogtag(bot, sessionID);
        }

        // generate new inventory ID
        bot = helpfunc_f.generateInventoryID(bot);

        return bot;
    }

    generate(info, sessionID)
    {
        let generatedBots = [];

        for (const condition of info.conditions)
        {
            for (let i = 0; i < condition.Limit; i++)
            {
                let bot = json.parse(json.stringify(database_f.database.tables.bots.base));
                let botId = utility.getRandomIntEx(99999999);

                bot._id = "bot" + botId;
                bot.aid = botId;
                bot.Info.Settings.BotDifficulty = condition.Difficulty;
                bot = this.generateBot(bot, condition.Role, sessionID);
                generatedBots.unshift(bot);
            }
        }

        return generatedBots;
    }
}

class BotCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/bot/generate", this.generateBots.bind());
    }

    generateBots(url, info, sessionID)
    {
        return response_f.responseController.getBody(bots_f.botController.generate(info, sessionID));
    }
}

class BotConfig
{
    constructor()
    {
        this.pmcSpawn = {
            "enabled": true,
            "spawnChance": 35,
            "usecChance": 50
        };
    }
}

module.exports.botController = new BotController();
module.exports.botCallbacks = new BotCallbacks();
module.exports.botConfig = new BotConfig();
