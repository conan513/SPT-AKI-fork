/* keepalive.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

"use strict";

class Controller
{
    execute(sessionID)
    {
        if (!account_f.server.isWiped(sessionID))
        {
            trader_f.controller.updateTraders(sessionID);
            hideout_f.controller.updatePlayerHideout(sessionID);
        }

        return {"msg": "OK"};
    }
}

class Callbacks
{
    constructor()
    {
        router_f.router.addStaticRoute("/client/game/keepalive", this.execute.bind());
    }

    execute(url, info, sessionID)
    {
        return response_f.controller.getBody(keepalive_f.controller.execute(sessionID));
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
