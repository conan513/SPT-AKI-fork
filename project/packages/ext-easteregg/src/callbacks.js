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
        easteregg_f.controller.load();
    }

    generateBots(url, info, sessionID)
    {
        return https_f.response.getBody(easteregg_f.controller.generate(info, sessionID));
    }
}

module.exports.Callbacks = Callbacks;
