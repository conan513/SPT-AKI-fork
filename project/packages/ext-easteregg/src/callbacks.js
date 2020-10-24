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
        core_f.packager.onLoad["easteregg"] = this.load.bind();
        https_f.router.onStaticRoute["/client/game/bot/generate"] = this.generateBots.bind(this);
    }

    load()
    {
        database_f.server.tables.bots.special = {
            "senko": common_f.json.deserialize(common_f.vfs.readFile("packages/ext-easteregg/db/bots/senko.json")),
            "waffle": common_f.json.deserialize(common_f.vfs.readFile("packages/ext-easteregg/db/bots/waffle.json"))
        };
    }

    generateBots(url, info, sessionID)
    {
        if (easteregg_f.config.enabled)
        {
            return https_f.response.getBody(easteregg_f.controller.generate(info, sessionID));
        }
        else
        {
            return https_f.response.getBody(bots_f.controller.generate(info, sessionID));
        }
    }
}

module.exports.Callbacks = Callbacks;
