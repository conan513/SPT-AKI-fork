/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

class DataCallbacks
{
    static getGlobals(url, info, sessionID)
    {
        database_f.server.tables.globals.time = Date.now() / 1000;
        return https_f.response.getBody(database_f.server.tables.globals);
    }

    static getTemplateItems(url, info, sessionID)
    {
        return https_f.response.getUnclearedBody(database_f.server.tables.templates.items);
    }

    static getTemplateHandbook(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.handbook);
    }

    static getTemplateSuits(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.customization);
    }

    static getTemplateCharacter(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.character);
    }

    static getTemplateQuests(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.templates.quests);
    }

    static getHideoutSettings(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.settings);
    }

    static getHideoutAreas(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.areas);
    }

    static gethideoutProduction(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.production);
    }

    static getHideoutScavcase(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.hideout.scavcase);
    }

    static getLocalesLanguages(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.locales.languages);
    }

    static getLocalesMenu(url, info, sessionID)
    {
        return https_f.response.getBody(database_f.server.tables.locales.menu[url.replace("/client/menu/locale/", "")]);
    }

    static getLocalesGlobal(url, info, sessionID)
    {
        return https_f.response.getUnclearedBody(database_f.server.tables.locales.global[url.replace("/client/locale/", "")]);
    }
}

module.exports = DataCallbacks;
