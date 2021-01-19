/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

class DatabaseImporter
{
    constructor()
    {
        core_f.packager.onLoad["loadDatabase"] = this.load.bind(this);

        https_f.router.addStaticRoute("/client/globals", "Aki", this.getGlobals.bind(this));
        https_f.router.addStaticRoute("/client/items", "Aki", this.getTemplateItems.bind(this));
        https_f.router.addStaticRoute("/client/handbook/templates", "Aki", this.getTemplateHandbook.bind(this));
        https_f.router.addStaticRoute("/client/customization", "Aki", this.getTemplateSuits.bind(this));
        https_f.router.addStaticRoute("/client/account/customization", "Aki", this.getTemplateCharacter.bind(this));
        https_f.router.addStaticRoute("/client/hideout/production/recipes", "Aki", this.gethideoutProduction.bind(this));
        https_f.router.addStaticRoute("/client/hideout/settings", "Aki", this.getHideoutSettings.bind(this));
        https_f.router.addStaticRoute("/client/hideout/areas", "Aki", this.getHideoutAreas.bind(this));
        https_f.router.addStaticRoute("/client/hideout/production/scavcase/recipes", "Aki", this.getHideoutScavcase.bind(this));
        https_f.router.addStaticRoute("/client/languages", "Aki", this.getLocalesLanguages.bind(this));
        https_f.router.addDynamicRoute("/client/menu/locale/", "Aki", this.getLocalesMenu.bind(this));
        https_f.router.addDynamicRoute("/client/locale/", "Aki", this.getLocalesGlobal.bind(this));
    }

    load()
    {
        const filepath = (globalThis.G_RELEASE_CONFIGURATION) ? "Aki_Data/Server/" : "./assets/";
        database_f.server.tables = this.loadRecursive(`${filepath}database/`);
        this.loadImages(`${filepath}images/`);
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

    loadImages(filepath)
    {
        const dirs = common_f.vfs.getDirs(filepath);
        const routes = [
            "/files/CONTENT/banners/",
            "/files/handbook/",
            "/files/Hideout/",
            "/files/quest/icon/",
            "/files/trader/avatar/",
        ];

        for (const i in dirs)
        {
            const files = common_f.vfs.getFiles(`${filepath}${dirs[i]}`);

            for (const file of files)
            {
                const filename = file.split(".").slice(0, -1).join(".");
                https_f.image.onRoute[`${routes[i]}${filename}`] = `${filepath}${dirs[i]}/${file}`;
            }
        }
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
}

module.exports = new DatabaseImporter();
