/* routes.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

// TODO: remove this
class RoutesCallbacks
{
    constructor()
    {
        server.addStartCallback("routeMissing", this.load.bind());
    }

    load()
    {
        db.user.configs.gameplay = "user/configs/gameplay.json";
    }
}

module.exports.routesCallbacks = new RoutesCallbacks();
