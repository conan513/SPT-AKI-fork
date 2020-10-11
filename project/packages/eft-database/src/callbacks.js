/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

const fs = require("fs");

class Callbacks
{
    constructor()
    {
        server_f.server.startCallback["loadDatabase"] = this.load.bind(this);
        server_f.server.respondCallback["IMAGE"] = this.sendImage.bind(this);
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
        router_f.router.dynamicRoutes[".jpg"] = this.getImage.bind(this);
        router_f.router.dynamicRoutes[".png"] = this.getImage.bind(this);
    }

    loadRecursive(filepath)
    {
        let result = {};

        // add file content to result
        const files = fs.readdirSync(filepath).filter((file) =>
        {
            return fs.statSync(`${filepath}/${file}`).isFile();
        });

        for (const node in files)
        {
            const fileName = files[node].split(".").slice(0, -1).join(".");
            result[fileName] = json_f.instance.parse(json_f.instance.read(`${filepath}${files[node]}`));
        }

        // deep tree search
        const directories = fs.readdirSync(filepath).filter((file) =>
        {
            return fs.statSync(`${filepath}/${file}`).isDirectory();
        });

        for (const node of directories)
        {
            result[node] = this.loadRecursive(`${filepath}${node}/`);
        }

        return result;
    }
    
    load()
    {
        database_f.server.tables = this.loadRecursive("packages/eft-database/db/");
    }

    getImage(url, info, sessionID)
    {
        return "IMAGE";
    }

    getGlobals(url, info, sessionID)
    {
        database_f.server.tables.globals.time = Date.now() / 1000;
        return response_f.controller.getBody(database_f.server.tables.globals);
    }

    getTemplateItems(url, info, sessionID)
    {
        return response_f.controller.getUnclearedBody(database_f.server.tables.templates.items);
    }

    getTemplateHandbook(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.templates.handbook);
    }

    getTemplateSuits(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.templates.suits);
    }

    getTemplateQuests(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.templates.quests);
    }

    getHideoutSettings(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.hideout.settings);
    }

    getHideoutAreas(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.hideout.areas);
    }

    gethideoutProduction(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.hideout.production);
    }

    getHideoutScavcase(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.hideout.scavcase);
    }

    getLocalesLanguages(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.locales.languages);
    }

    getLocalesMenu(url, info, sessionID)
    {
        return response_f.controller.getBody(database_f.server.tables.locales.menu[url.replace("/client/menu/locale/", "")]);
    }

    getLocalesGlobal(url, info, sessionID)
    {
        return response_f.controller.getUnclearedBody(database_f.server.tables.locales.global[url.replace("/client/locale/", "")]);
    }

    sendImage(sessionID, req, resp, body)
    {
        let splittedUrl = req.url.split("/");
        let filename = splittedUrl[splittedUrl.length - 1].split(".").slice(0, -1).join(".");
        let filepath = "packages/eft-database/res/";

        // get images to look through
        if (req.url.includes("/quest"))
        {
            logger_f.instance.logInfo("[IMG.quests]:" + req.url);
            filepath += "quests";
        }
        else if (req.url.includes("/handbook"))
        {
            logger_f.instance.logInfo("[IMG.handbook]:" + req.url);
            filepath += "handbook";
        }
        else if (req.url.includes("/avatar"))
        {
            logger_f.instance.logInfo("[IMG.trader]:" + req.url);
            filepath += "traders";
        }
        else if (req.url.includes("banners"))
        {
            logger_f.instance.logInfo("[IMG.banners]:" + req.url);
            filepath += "banners";
        }
        else
        {
            logger_f.instance.logInfo("[IMG.hideout]:" + req.url);
            filepath += "hideout";
        }

        // send image
        server_f.server.sendFile(resp, `${filepath}/${filename}.png`);
    }
}

module.exports.Callbacks = Callbacks;
