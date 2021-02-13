/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

const DatabaseServer = require("../servers/DatabaseServer");
const HttpResponse = require("../utils/HttpResponse");

class DataCallbacks
{
    static getGlobals(url, info, sessionID)
    {
        DatabaseServer.tables.globals.time = Date.now() / 1000;
        return HttpResponse.getBody(DatabaseServer.tables.globals);
    }

    static getTemplateItems(url, info, sessionID)
    {
        return HttpResponse.getUnclearedBody(DatabaseServer.tables.templates.items);
    }

    static getTemplateHandbook(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.templates.handbook);
    }

    static getTemplateSuits(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.templates.customization);
    }

    static getTemplateCharacter(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.templates.character);
    }

    static getTemplateQuests(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.templates.quests);
    }

    static getHideoutSettings(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.hideout.settings);
    }

    static getHideoutAreas(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.hideout.areas);
    }

    static gethideoutProduction(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.hideout.production);
    }

    static getHideoutScavcase(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.hideout.scavcase);
    }

    static getLocalesLanguages(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.locales.languages);
    }

    static getLocalesMenu(url, info, sessionID)
    {
        return HttpResponse.getBody(DatabaseServer.tables.locales.menu[url.replace("/client/menu/locale/", "")]);
    }

    static getLocalesGlobal(url, info, sessionID)
    {
        return HttpResponse.getUnclearedBody(DatabaseServer.tables.locales.global[url.replace("/client/locale/", "")]);
    }
}

module.exports = DataCallbacks;
