/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        router_f.router.staticRoutes["/client/game/bot/generate"] = this.generateBots.bind(this);
        router_f.router.dynamicRoutes["/singleplayer/settings/bot/limit/"] = this.getBotLimit.bind(this);
        router_f.router.dynamicRoutes["/singleplayer/settings/bot/difficulty/"] = this.getBotDifficulty.bind(this);
    }

    getBotLimit(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 1];
        return response_f.controller.noBody(bots_f.controller.getBotLimit(type));
    }

    getBotDifficulty(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 2].toLowerCase();
        let difficulty = splittedUrl[splittedUrl.length - 1];
        return response_f.controller.noBody(bots_f.controller.getBotDifficulty(type, difficulty));
    }

    generateBots(url, info, sessionID)
    {
        return response_f.controller.getBody(bots_f.controller.generate(info, sessionID));
    }
}

module.exports.Callbacks = Callbacks;
