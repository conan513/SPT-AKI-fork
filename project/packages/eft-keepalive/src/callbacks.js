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
        router_f.router.staticRoutes["/client/game/keepalive"] = this.execute.bind(this);
    }

    execute(url, info, sessionID)
    {
        if (!account_f.controller.isWiped(sessionID))
        {
            trader_f.controller.updateTraders(sessionID);
            hideout_f.controller.updatePlayerHideout(sessionID);
        }

        return response_f.controller.getBody({"msg": "OK"});
    }
}

module.exports.Callbacks = Callbacks;
