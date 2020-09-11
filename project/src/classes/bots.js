"use strict";

class BotServer
{
    constructor()
    {
        this.bots = [];
        this.globalDifficulty = {};
        this.limitSettings = {};
        this.pmcSettings = {};
    }

    initialize()
    {
        for (let file in db.bots)
        {
            // skip bot base
            if (file.includes("base"))
            {
                continue;
            }

            // load bot limits
            if (file.includes("setting_limits"))
            {
                this.limitSettings = json.parse(json.read(db.bots[file]));
            }

            // load pmc generation settings
            if (file.includes("setting_pmc"))
            {
                this.pmcSettings = json.parse(json.read(db.bots[file]));
            }

            // load global bots difficulty
            if (file.includes("difficulty_global"))
            {
                this.globalDifficulty = json.parse(json.read(db.bots[file]));
            }

            // load bot to the server
            this.bots[file.replace("bot_", "")] = json.parse(json.read(db.bots[file]));
        }
    }

    generateBot(bot, role, sessionID)
    {
        let type = (role === "cursedAssault") ? "assault" : role;
        let node = {};

        // chance to spawn simulated PMC AIs
        if ((type === "assault" || type === "pmcBot") && this.pmcSettings.enabled)
        {
            let spawnChance = utility.getRandomInt(0, 99);
            let sideChance = utility.getRandomInt(0, 99);

            if (spawnChance < this.pmcSettings.spawnChance)
            {
                if (sideChance < this.pmcSettings.usecChance)
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
        node = this.bots[type.toLowerCase()];

        bot.Info.Settings.Role = role;
        bot.Info.Nickname = utility.getRandomValue(node.names);
        bot.Info.experience = itm_hf.getRandomExperience();
        bot.Info.Level = profile_f.calculateLevel(bot);
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
            bot = itm_hf.addDogtag(bot, sessionID);
        }

        // generate new inventory ID
        bot = itm_hf.generateInventoryID(bot);

        return bot;
    }

    generate(info, sessionID)
    {
        let generatedBots = [];

        for (const condition of info.conditions)
        {
            for (let i = 0; i < condition.Limit; i++)
            {
                let bot = json.parse(json.read(db.bots.base));
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
        server.addStartCallback("loadBots", this.load.bind());
        router.addStaticRoute("/client/game/bot/generate", this.generateBots.bind());
        router.addDynamicRoute("/singleplayer/settings/bot/limit/", this.getBotLimit.bind());
        router.addDynamicRoute("/singleplayer/settings/bot/difficulty/", this.getBotDifficulty.bind());
    }

    load()
    {
        bots_f.botServer.initialize();
    }

    generateBots(url, info, sessionID)
    {
        return response_f.getBody(bots_f.botServer.generate(info, sessionID));
    }

    getBotLimit(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 1];

        if (type === "cursedAssault" || type === "assaultGroup")
        {
            type = "assault";
        }

        return response_f.noBody(bots_f.botServer.limitSettings[type]);
    }

    getBotDifficulty(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 2].toLowerCase();
        let difficulty = splittedUrl[splittedUrl.length - 1];

        switch (type)
        {
            case "core":
                return json.stringify(bots_f.botServer.globalDifficulty);

            case "cursedassault":
                type = "assault";
                break;

            case "test":
            case "assaultgroup":
            case "followergluharsnipe":
            case "bosstest":
            case "followertest":
                /* unused bots by BSG, might have use */
                type = "pmcbot";
                break;

            default:
                break;
        }

        return json.stringify(bots_f.botServer.bots[type].difficulties[difficulty]);
    }
}

module.exports.botServer = new BotServer();
module.exports.botCallbacks = new BotCallbacks();
