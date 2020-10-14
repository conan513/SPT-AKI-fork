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
        https_f.router.onStaticRoute["/client/game/profile/items/moving"] = this.handleEvents.bind(this);
    }

    handleEvents(url, info, sessionID)
    {
        return https_f.response.getBody(item_f.eventHandler.handleEvents(info, sessionID));
    }
}

module.exports.Callbacks = Callbacks;