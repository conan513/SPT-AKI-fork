/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

class Callbacks
{
    constructor()
    {
        core_f.packager.onLoad["loadDatabase"] = this.load.bind(this);
        https_f.server.onRespond["IMAGE"] = this.sendImage.bind(this);
        https_f.router.onStaticRoute["/client/globals"] = this.getGlobals.bind(this);
        https_f.router.onStaticRoute["/client/items"] = this.getTemplateItems.bind(this);
        https_f.router.onStaticRoute["/client/handbook/templates"] = this.getTemplateHandbook.bind(this);
        https_f.router.onStaticRoute["/client/customization"] = this.getTemplateSuits.bind(this);
        https_f.router.onStaticRoute["/client/account/customization"] = this.getTemplateCharacter.bind(this);
        https_f.router.onStaticRoute["/client/hideout/production/recipes"] = this.gethideoutProduction.bind(this);
        https_f.router.onStaticRoute["/client/hideout/settings"] = this.getHideoutSettings.bind(this);
        https_f.router.onStaticRoute["/client/hideout/areas"] = this.getHideoutAreas.bind(this);
        https_f.router.onStaticRoute["/client/hideout/production/scavcase/recipes"] = this.getHideoutScavcase.bind(this);
        https_f.router.onStaticRoute["/client/languages"] = this.getLocalesLanguages.bind(this);
        https_f.router.onDynamicRoute["/client/menu/locale/"] = this.getLocalesMenu.bind(this);
        https_f.router.onDynamicRoute["/client/locale/"] = this.getLocalesGlobal.bind(this);
        https_f.router.onDynamicRoute[".jpg"] = this.getImage.bind(this);
        https_f.router.onDynamicRoute[".png"] = this.getImage.bind(this);
    }

    loadRecursive(filepath)
    {
        let result = {};

        // get all filepaths
        const files = common_f.vfs.getFiles(filepath);
        const directories = common_f.vfs.getDirs(filepath);

        // add file content to result
        for (const file of files)
        {
            const filename = file.split(".").slice(0, -1).join(".");
            result[filename] = common_f.json.deserialize(common_f.vfs.readFile(`${filepath}${file}`));
        }

        // deep tree search
        for (const dir of directories)
        {
            result[dir] = this.loadRecursive(`${filepath}${dir}/`);
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
        return https_f.response.getBody(database_f.server.tables.globals);
    }

    getTemplateItems(url, info, sessionID)
    {
        return https_f.response.getUnclearedBody(database_f.server.tables.templates.items);
    }

    getTemplateHandbook(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.handbook);
    }

    getTemplateSuits(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.suits);
    }

    getTemplateCharacter(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.character);
    }

    getTemplateQuests(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.quests);
    }

    getHideoutSettings(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.settings);
    }

    getHideoutAreas(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.areas);
    }

    gethideoutProduction(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.production);
    }

    getHideoutScavcase(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.scavcase);
    }

    getLocalesLanguages(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.locales.languages);
    }

    getLocalesMenu(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.locales.menu[url.replace("/client/menu/locale/", "")]);
    }

    getLocalesGlobal(url, info, sessionID)
    {
        return https_f.response.getUnclearedBody(database_f.server.tables.locales.global[url.replace("/client/locale/", "")]);
    }

    sendImage(sessionID, req, resp, body)
    {
        let splittedUrl = req.url.split("/");
        let filename = splittedUrl[splittedUrl.length - 1].split(".").slice(0, -1).join(".");
        let filepath = "packages/eft-database/res/";

        // get images to look through
        if (req.url.includes("/quest"))
        {
            common_f.logger.logInfo("[IMG.quests]:" + req.url);
            filepath += "quests";
        }
        else if (req.url.includes("/handbook"))
        {
            common_f.logger.logInfo("[IMG.handbook]:" + req.url);
            filepath += "handbook";
        }
        else if (req.url.includes("/avatar"))
        {
            common_f.logger.logInfo("[IMG.trader]:" + req.url);
            filepath += "traders";
        }
        else if (req.url.includes("banners"))
        {
            common_f.logger.logInfo("[IMG.banners]:" + req.url);
            filepath += "banners";
        }
        else
        {
            common_f.logger.logInfo("[IMG.hideout]:" + req.url);
            filepath += "hideout";
        }

        // send image
        https_f.server.sendFile(resp, `${filepath}/${filename}.png`);
    }
}

module.exports.Callbacks = Callbacks;
