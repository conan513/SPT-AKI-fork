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
    }

    load()
    {
        const filepath = (globalThis.G_RELEASE_CONFIGURATION) ? "Aki_Data/Server/" : "./assets/";
        database_f.server.tables = this.loadRecursive(`${filepath}database/`);
        this.loadImages(filepath);
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
        const basepath = `${filepath}images/`;
        const res = common_f.vfs.getDirs(basepath);
        const routes = [
            "/files/CONTENT/banners/",
            "/files/handbook/",
            "/files/Hideout/",
            "/files/quest/icon/",
            "/files/trader/avatar/",
        ];

        for (const i in res)
        {
            const files = common_f.vfs.getFiles(`${basepath}${res[i]}/`);

            for (const file of files)
            {
                const filename = file.split(".").slice(0, -1).join(".");
                https_f.image.onRoute[`${routes[i]}${filename}`] = `${basepath}${res[i]}/${file}`;
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
