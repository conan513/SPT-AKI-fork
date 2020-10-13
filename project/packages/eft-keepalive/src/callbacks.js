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
        https_f.router.onStaticRoute["/client/game/keepalive"] = this.execute.bind(this);
    }

    execute(url, info, sessionID)
    {
        keepalive_f.controller.execute(sessionID);
        return https_f.response.getBody({"msg": "OK"});
    }
}

module.exports.Callbacks = Callbacks;
