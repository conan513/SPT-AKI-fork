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
        const filepath = "packages/ext-easteregg/";
        const names = [
            "senko",
            "ginja",
            "wafflelord",
            "digitalbarrito",
            "reider123",
            "terkoiz",
            "elitecheez",
            "cheekiestbreeki"
        ];

        // setup special bots
        database_f.server.tables.bots.special = {};

        // for each contributor
        for (const name of names)
        {
            this.loadBot(name, filepath);
            this.loadDogtag(name, filepath);
        }
    }

    loadBot(name, filepath)
    {
        database_f.server.tables.bots.special[name] = common_f.json.deserialize(common_f.vfs.readFile(`${filepath}db/bots/${name}.json`));
    }

    loadDogtag(name, filepath)
    {
        // constants
        const dogtagBase = "59f32c3b86f77472a31742f0";
        const inventoryBase = "55d7217a4bdc2d86028b456d";
        const dogtagName = `${name}dogtag`;

        // item
        let dogtagItem = common_f.json.clone(database_f.server.tables.templates.items[dogtagBase]);

        dogtagItem._id = dogtagName;
        dogtagItem._name = dogtagName;
        dogtagItem._props.Prefab.path = "assets/content/items/barter/dog_tags/item_dogtag_t2.bundle";
        database_f.server.tables.templates.items[dogtagName] = dogtagItem;

        // handbook
        let dogtagHandbook = common_f.json.clone(database_f.server.tables.templates.handbook.Items.find((item) =>
        {
            return item.Id === dogtagBase;
        }));

        dogtagHandbook.Id = dogtagItem._id;
        database_f.server.tables.templates.handbook.Items.push(dogtagHandbook);

        // locale
        for (const localeID in database_f.server.tables.locales.global)
        {
            database_f.server.tables.locales.global[localeID].templates[dogtagName] = common_f.json.deserialize(common_f.vfs.readFile(`${filepath}db/locales/templates/${name}.json`));
        }

        // modify inventory to support custom dogtag
        let inventory = database_f.server.tables.templates.items[inventoryBase];

        for (const slot in inventory._props.Slots)
        {
            if (inventory._props.Slots[slot]._name === "Dogtag")
            {
                inventory._props.Slots[slot]._props.filters[0].Filter.push(dogtagName);
                break;
            }
        }
    }

    generate(info, sessionID)
    {
        let generatedBots = [];

        for (const condition of info.conditions)
        {
            for (let i = 0; i < condition.Limit; i++)
            {
                const eligable = (condition.Role === "assault" || condition.Role === "cursedAssault" || condition.Role === "pmcBot");
                const createSpecial = (eligable && common_f.random.getInt(0, 99) < easteregg_f.config.spawnChance);
                const bot = (createSpecial) ? this.generateSpecial(condition, sessionID) : this.generateNormal(condition, sessionID);

                generatedBots.unshift(bot);
            }
        }

        return generatedBots;
    }

    generateNormal(condition, sessionID)
    {
        let bot = common_f.json.clone(database_f.server.tables.bots.base);

        bot.Info.Settings.BotDifficulty = condition.Difficulty;
        bot = bots_f.controller.generateBot(bot, condition.Role, sessionID);

        return bot;
    }

    generateSpecial(condition, sessionID)
    {
        let bot = common_f.json.clone(common_f.random.getKeyValue(database_f.server.tables.bots.special));

        bot.Info.Settings.BotDifficulty = condition.Difficulty;
        bot = this.generateDogtag(bot);
        bot = bots_f.controller.generateId(bot);
        bot = helpfunc_f.helpFunctions.generateInventoryID(bot);

        return bot;
    }

    generateDogtag(bot)
    {
        bot.Inventory.items.push({
            _id: common_f.hash.generate(),
            _tpl: `${bot.Info.LowerNickname}dogtag`,
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
