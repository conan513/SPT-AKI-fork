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
        const names = ["senko", "ginja", "ereshkigal", "wafflelord", "digitalbarrito"];

        // setup special bots
        database_f.server.tables.bots.special = {};

        // for each contributor
        for (const name of names)
        {
            // bot
            database_f.server.tables.bots.special[name] = common_f.json.deserialize(common_f.vfs.readFile(`packages/ext-easteregg/db/bots/${name}.json`));

            // dogtag item
            let dogtagItem = helpfunc_f.helpFunctions.clone(database_f.server.tables.templates.items["59f32c3b86f77472a31742f0"]);

            dogtagItem._id = `${name}dogtag`;
            dogtagItem._props.Prefab.path = "assets/content/items/barter/dog_tags/item_dogtags_t2.bundle";
            database_f.server.tables.templates.items[`${name}dogtag`] = dogtagItem;

            this.addDogtag(dogtagItem._id);

            // dogtag handbook
            let dogtagHandbook = helpfunc_f.helpFunctions.clone(database_f.server.tables.templates.handbook.Items["59f32c3b86f77472a31742f0"]);

            dogtagHandbook.Id = dogtagItem._id;
            database_f.server.tables.templates.handbook.Items[dogtagItem._id] = dogtagHandbook;

            // dogtag locale
            for (const localeID in database_f.server.tables.locales.globals)
            {
                database_f.server.tables.locales.globals[localeID].templates[`${name}dogtag`] = common_f.json.deserialize(common_f.vfs.readFile(`packages/ext-easteregg/db/locales/${name}.json`));
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
                const createSpecial = ((condition.Role === "assault" || condition.Role === "pmcBot") && (common_f.random.getInt(0, 99) < easteregg_f.config.spawnChance));
                const bot = (createSpecial) ? this.generateSpecial(condition, sessionID) : this.generateNormal(condition, sessionID);

                generatedBots.unshift(bot);
            }
        }

        return generatedBots;
    }

    generateNormal(condition, sessionID)
    {
        let bot = helpfunc_f.helpFunctions.clone(database_f.server.tables.bots.base);
        
        bot.Info.Settings.BotDifficulty = condition.Difficulty;
        bot = bots_f.controller.generateBot(bot, condition.Role, sessionID);

        return bot;
    }

    generateSpecial(condition, sessionID)
    {
        let bot = helpfunc_f.helpFunctions.clone(common_f.random.getKeyValue(database_f.server.tables.bots.special));
        
        bot.Info.Settings.BotDifficulty = condition.Difficulty;
        //bot = this.generateDogtag(bot);
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

    addDogtag(itemID)
    {
        // allow custom dogtag
        let inventory = database_f.server.tables.templates.items["55d7217a4bdc2d86028b456d"];

        for (const slot in inventory._props.Slots)
        {
            if (inventory._props.Slots[slot]._name === "Dogtag")
            {
                inventory._props.Slots[slot]._props.filters[0].Filter.push(itemID);
                break;
            }
        }
    }
}

module.exports.Controller = Controller;
