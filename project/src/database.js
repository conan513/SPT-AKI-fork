"use strict";

class DatabaseServer
{
    constructor()
    {
        this.tables = {};
    }
}

class DatabaseCallbacks
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
        // global
        database_f.database.tables.globals = json.parse(json.read(db.others.globals));

        // locations
        database_f.database.tables.locations = {
            "bigmap": json.parse(json.read(db.locations.bigmap)),
            "develop": json.parse(json.read(db.locations.develop)),
            "factory4_day": json.parse(json.read(db.locations.factory4_day)),
            "factory4_night": json.parse(json.read(db.locations.factory4_night)),
            "hideout": json.parse(json.read(db.locations.hideout)),
            "interchange": json.parse(json.read(db.locations.interchange)),
            "laboratory": json.parse(json.read(db.locations.laboratory)),
            "lighthouse": json.parse(json.read(db.locations.lighthouse)),
            "privatearea": json.parse(json.read(db.locations.privatearea)),
            "rezervbase": json.parse(json.read(db.locations.rezervbase)),
            "shoreline": json.parse(json.read(db.locations.shoreline)),
            "suburbs": json.parse(json.read(db.locations.suburbs)),
            "tarkovstreets": json.parse(json.read(db.locations.tarkovstreets)),
            "terminal": json.parse(json.read(db.locations.terminal)),
            "town": json.parse(json.read(db.locations.town)),
            "woods": json.parse(json.read(db.locations.woods)),
            "base": json.parse(json.read(db.locations.base))
        };

        // loot
        database_f.database.tables.loot = {
            "statics": json.parse(json.read(db.loot.statics))
        };

        // templates
        database_f.database.tables.templates = {
            "items": json.parse(json.read(db.templates.items)),
            "handbook": json.parse(json.read(db.templates.handbook)),
            "suits": json.parse(json.read(db.templates.suits)),
            "quests": json.parse(json.read(db.templates.quests)),
            "weather": json.parse(json.read(db.templates.weather))
        };

        // hideout
        database_f.database.tables.hideout = {
            "settings": json.parse(json.read(db.hideout.settings)),
            "areas": json.parse(json.read(db.hideout.areas)),
            "production": json.parse(json.read(db.hideout.production)),
            "scavcase": json.parse(json.read(db.hideout.scavcase))
        };

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
            if (file.includes("difficulty_global"))
            {
                bots.globalDifficulty = json.parse(json.read(db.bots[file]));
            }

            // load bot to the server
            bots.type[file.replace("bot_", "")] = json.parse(json.read(db.bots[file]));
        }

        database_f.database.tables.bots = bots;

        // TODO: remove from global space
        global.gameplayConfig = json.parse(json.read(db.user.configs.gameplay));
    }

    getGlobals(url, info, sessionID)
    {
        database_f.database.tables.globals.time = Date.now() / 1000;
        return response_f.responseController.getBody(database_f.database.tables.globals);
    }

    getTemplateItems(url, info, sessionID)
    {
        return response_f.responseController.getUnclearedBody(database_f.database.tables.templates.items);
    }

    getTemplateHandbook(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.templates.handbook);
    }

    getTemplateSuits(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.templates.suits);
    }

    getTemplateQuests(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.templates.quests);
    }

    getHideoutSettings(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.hideout.settings);
    }

    getHideoutAreas(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.hideout.areas);
    }

    gethideoutProduction(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.hideout.production);
    }

    getHideoutScavcase(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.hideout.scavcase);
    }

    getLocalesLanguages(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.locales.languages);
    }

    getLocalesMenu(url, info, sessionID)
    {
        return response_f.responseController.getBody(database_f.database.tables.locales.menu[url.replace("/client/menu/locale/", "")]);
    }

    getLocalesGlobal(url, info, sessionID)
    {
        return response_f.responseController.getUnclearedBody(database_f.database.tables.locales.global[url.replace("/client/locale/", "")]);
    }
}

module.exports.database = new DatabaseServer();
module.exports.databaseCallbacks = new DatabaseCallbacks();