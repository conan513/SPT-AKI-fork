/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.router.staticRoutes["/client/game/keepalive"] = this.execute.bind(this);
    }

    execute(url, info, sessionID)
    {
        if (!account_f.controller.isWiped(sessionID))
        {
            trader_f.controller.updateTraders(sessionID);
            hideout_f.controller.updatePlayerHideout(sessionID);
            dialogue_f.controller.removeExpiredItems(sessionID);
        }

        return https_f.response.getBody({"msg": "OK"});
    }
}

module.exports.Callbacks = Callbacks;
