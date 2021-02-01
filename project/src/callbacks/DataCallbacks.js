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
        return https_f.response.getBody(database_f.server.tables.templates.customization);
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

module.exports = new DataCallbacks();
