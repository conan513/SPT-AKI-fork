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
        https_f.router.staticRoutes["/client/game/profile/items/moving"] = this.handleRoutes.bind(this);
    }

    handleRoutes(url, info, sessionID)
    {
        return https_f.response.getBody(item_f.router.handleRoutes(info, sessionID));
    }
}

module.exports.Callbacks = Callbacks;
