/* keepalive.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

"use strict";

class KeepAliveController
{
    execute(sessionID)
    {
        if (!account_f.accountServer.isWiped(sessionID))
        {
            trader_f.traderServer.updateTraders(sessionID);
            hideout_f.hideoutController.updatePlayerHideout(sessionID);
        }

        return {"msg": "OK"};
    }
}

class KeepAliveCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/keepalive", this.execute.bind());
    }

    execute(url, info, sessionID)
    {
        return response_f.responseController.getBody(keepalive_f.keepAliveController.execute(sessionID));
    }
}

module.exports.keepAliveController = new KeepAliveController();
module.exports.keepAliveCallbacks = new KeepAliveCallbacks();
