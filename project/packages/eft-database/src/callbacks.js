/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

class Callbacks
{
    constructor()
    {
        server_f.server.startCallback["loadDatabase"] = this.load.bind(this);
        router_f.router.staticRoutes["/client/globals"] = this.getGlobals.bind(this);
        router_f.router.staticRoutes["/client/items"] = this.getTemplateItems.bind(this);
        router_f.router.staticRoutes["/client/handbook/templates"] = this.getTemplateHandbook.bind(this);
        router_f.router.staticRoutes["/client/customization"] = this.getTemplateSuits.bind(this);
        router_f.router.staticRoutes["/client/hideout/production/recipes"] = this.gethideoutProduction.bind(this);
        router_f.router.staticRoutes["/client/hideout/settings"] = this.getHideoutSettings.bind(this);
        router_f.router.staticRoutes["/client/hideout/areas"] = this.getHideoutAreas.bind(this);
        router_f.router.staticRoutes["/client/hideout/production/scavcase/recipes"] = this.getHideoutScavcase.bind(this);
        router_f.router.staticRoutes["/client/languages"] = this.getLocalesLanguages.bind(this);
        router_f.router.dynamicRoutes["/client/menu/locale/"] = this.getLocalesMenu.bind(this);
        router_f.router.dynamicRoutes["/client/locale/"] = this.getLocalesGlobal.bind(this);
    }

    load()
    {
        // warmup
        database_f.database.tables.locations = {};
        database_f.database.tables.loot = {};
        database_f.database.tables.templates = {};
        database_f.database.tables.hideout = {};

        // global
        database_f.database.tables.globals = json_f.instance.parse(json_f.instance.read(db.others.globals));

        // locations
        for (let file in db.locations)
        {
            database_f.database.tables.locations[file] = json_f.instance.parse(json_f.instance.read(db.locations[file]));
        }

        // loot
        for (let file in db.loot)
        {
            database_f.database.tables.loot[file] = json_f.instance.parse(json_f.instance.read(db.loot.statics));
        }

        // templates
        for (let file in db.templates)
        {
            database_f.database.tables.templates[file] = json_f.instance.parse(json_f.instance.read(db.templates[file]));
        }

        // hideout
        for (let file in db.hideout)
        {
            database_f.database.tables.hideout[file] = json_f.instance.parse(json_f.instance.read(db.hideout[file]));
        }

        // locales
        let locales = {
            "languages": json_f.instance.parse(json_f.instance.read(db.locales.languages)),
            "menu": {},
            "global": {}
        };

        for (let file in db.locales)
        {
            // add file to the database
            if (file.includes("menu_"))
            {
                // startup locale
                locales.menu[file.replace("menu_", "")] = json_f.instance.parse(json_f.instance.read(db.locales[file]));
            }

            else if (file.includes("global_"))
            {
                // game locale
                locales.global[file.replace("global_", "")] = json_f.instance.parse(json_f.instance.read(db.locales[file]));
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
                ragfair.baseOffer = json_f.instance.parse(json_f.instance.read(db.traders.ragfair_offer));
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
                traders[traderID].base = json_f.instance.parse(json_f.instance.read(db.traders[file]));
            }

            else if (file.includes("suits_"))
            {
                // customization
                traders[traderID].suits = json_f.instance.parse(json_f.instance.read(db.traders[file]));
            }

            else if (file.includes("questassort_"))
            {
                // assortiment unlocked by quests
                traders[traderID].questassort = json_f.instance.parse(json_f.instance.read(db.traders[file]));
            }

            else if (file.includes("assort_"))
            {
                // assortiment
                traders[traderID].assort = json_f.instance.parse(json_f.instance.read(db.traders[file]));
            }

            else if (file.includes("dialogue_"))
            {
                // dialogue
                traders[traderID].dialogue = json_f.instance.parse(json_f.instance.read(db.traders[file]));
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
                bots.base = json_f.instance.parse(json_f.instance.read(db.bots[file]));
            }

            // load global bots difficulty
            else if (file.includes("difficulty_global"))
            {
                bots.globalDifficulty = json_f.instance.parse(json_f.instance.read(db.bots[file]));
            }

            // load bot to the server
            else if (file.includes("bot_"))
            {
                bots.type[file.replace("bot_", "")] = json_f.instance.parse(json_f.instance.read(db.bots[file]));
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
        return response_f.controller.getBody(database_f.database.tables.templates.quests);
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

module.exports.Callbacks = Callbacks;
