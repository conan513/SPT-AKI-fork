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
    generate(info, sessionID)
    {
        let generatedBots = [];

        for (const condition of info.conditions)
        {
            for (let i = 0; i < condition.Limit; i++)
            {
                const createSpecial = common_f.random.getInt(0, 99) < easteregg_f.config.spawnChance;
                const bot = (condition.Role !== "playerScav" && createSpecial) ? this.generateSpecial(condition, sessionID) : this.generateNormal(condition, sessionID);

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
        bot = bots_f.controller.generateDogtag(bot);
        bot = bots_f.controller.generateId(bot);
        bot = helpfunc_f.helpFunctions.generateInventoryID(bot);

        return bot;
    }
}

module.exports.Controller = Controller;
