/* database.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Server
{
    constructor()
    {
        this.tables = {};
    }
}

class Callbacks
{
    constructor()
    {
        // server start callback
        server.addStartCallback("loadDatabase", this.load.bind());

        // global
        router.addStaticRoute("/client/globals", this.getGlobals.bind());

        // templates
        router.addStaticRoute("/client/items", this.getTemplateItems.bind());
        router.addStaticRoute("/client/handbook/templates", this.getTemplateHandbook.bind());
        router.addStaticRoute("/client/customization", this.getTemplateSuits.bind());
        router.addStaticRoute("/client/quest/list", this.getTemplateQuests.bind());

        // hideout
        router.addStaticRoute("/client/hideout/production/recipes", this.gethideoutProduction.bind());
        router.addStaticRoute("/client/hideout/settings", this.getHideoutSettings.bind());
        router.addStaticRoute("/client/hideout/areas", this.getHideoutAreas.bind());
        router.addStaticRoute("/client/hideout/production/scavcase/recipes", this.getHideoutScavcase.bind());

        // locales
        router.addStaticRoute("/client/languages", this.getLocalesLanguages.bind());
        router.addDynamicRoute("/client/menu/locale/", this.getLocalesMenu.bind());
        router.addDynamicRoute("/client/locale/", this.getLocalesGlobal.bind());
    }

    load()
    {
        // warmup
        database_f.database.tables.locations = {};
        database_f.database.tables.loot = {};
        database_f.database.tables.templates = {};
        database_f.database.tables.hideout = {};

        // global
        database_f.database.tables.globals = json.parse(json.read(db.others.globals));

        // locations
        for (let file in db.locations)
        {
            database_f.database.tables.locations[file] = json.parse(json.read(db.locations[file]));
        }

        // loot
        for (let file in db.loot)
        {
            database_f.database.tables.loot[file] = json.parse(json.read(db.loot.statics));
        }

        // templates
        for (let file in db.templates)
        {
            database_f.database.tables.templates[file] = json.parse(json.read(db.templates[file]));
        }

        // hideout
        for (let file in db.hideout)
        {
            database_f.database.tables.hideout[file] = json.parse(json.read(db.hideout[file]));
        }

        // locales
        let locales = {
            "languages": json.parse(json.read(db.locales.languages)),
            "menu": {},
            "global": {}
        };

        for (let file in db.locales)
        {
            // add file to the database
            if (file.includes("menu_"))
            {
                // startup locale
                locales.menu[file.replace("menu_", "")] = json.parse(json.read(db.locales[file]));
            }

            else if (file.includes("global_"))
            {
                // game locale
                locales.global[file.replace("global_", "")] = json.parse(json.read(db.locales[file]));
            }
        }

        database_f.database.tables.locales = locales;

        // traders
        let traders = {};
        let ragfair = {
            "offers": {}
        };

        for (const file in db.traders)
        {
            let traderID = file.replace("base_", "")
                .replace("suits_", "")
                .replace("questassort_", "")
                .replace("assort_", "")
                .replace("dialogue_", "");

            // skip if there is no id
            if (file === "ragfair_offer")
            {
                ragfair.baseOffer = json.parse(json.read(db.traders.ragfair_offer));
                ragfair.baseOffer.startTime = Math.floor(new Date().getTime() / 1000);
                ragfair.baseOffer.endTime = ragfair.baseOffer.startTime + 3153600000;   // 1 century
                continue;
            }

            // add trader if it doesn't exist
            if (!(traderID in traders))
            {
                traders[traderID] = {};
            }

            // add file to the database
            if (file.includes("base_"))
            {
                // trader info
                traders[traderID].base = json.parse(json.read(db.traders[file]));
            }

            else if (file.includes("suits_"))
            {
                // customization
                traders[traderID].suits = json.parse(json.read(db.traders[file]));
            }

            else if (file.includes("questassort_"))
            {
                // assortiment unlocked by quests
                traders[traderID].questassort = json.parse(json.read(db.traders[file]));
            }

            else if (file.includes("assort_"))
            {
                // assortiment
                traders[traderID].assort = json.parse(json.read(db.traders[file]));
            }

            else if (file.includes("dialogue_"))
            {
                // dialogue
                traders[traderID].dialogue = json.parse(json.read(db.traders[file]));
            }
        }

        database_f.database.tables.traders = traders;
        database_f.database.tables.ragfair = ragfair;

        // bots
        let bots = {
            "base": {},
            "type": {},
            "globalDifficulty": {}
        };

        for (let file in db.bots)
        {
            // skip bot base
            if (file.includes("bot_base"))
            {
                bots.base = json.parse(json.read(db.bots[file]));
            }

            // load global bots difficulty
            else if (file.includes("difficulty_global"))
            {
                bots.globalDifficulty = json.parse(json.read(db.bots[file]));
            }

            // load bot to the server
            else if (file.includes("bot_"))
            {
                bots.type[file.replace("bot_", "")] = json.parse(json.read(db.bots[file]));
            }
        }

        database_f.database.tables.bots = bots;
    }

    getGlobals(url, info, sessionID)
    {
        database_f.database.tables.globals.time = Date.now() / 1000;
        return response_f.controller.getBody(database_f.database.tables.globals);
    }

    getTemplateItems(url, info, sessionID)
    {
        return response_f.controller.getUnclearedBody(database_f.database.tables.templates.items);
    }

    getTemplateHandbook(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.templates.handbook);
    }

    getTemplateSuits(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.templates.suits);
    }

    getTemplateQuests(url, info, sessionID)
    {
        return response_f.controller.getBody(quest_f.controller.getQuests(sessionID));
    }

    getHideoutSettings(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.hideout.settings);
    }

    getHideoutAreas(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.hideout.areas);
    }

    gethideoutProduction(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.hideout.production);
    }

    getHideoutScavcase(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.hideout.scavcase);
    }

    getLocalesLanguages(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.locales.languages);
    }

    getLocalesMenu(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.database.tables.locales.menu[url.replace("/client/menu/locale/", "")]);
    }

    getLocalesGlobal(url, info, sessionID)
    {
        return response_f.controller.getUnclearedBody(database_f.database.tables.locales.global[url.replace("/client/locale/", "")]);
    }
}

module.exports.database = new Server();
module.exports.callbacks = new Callbacks();