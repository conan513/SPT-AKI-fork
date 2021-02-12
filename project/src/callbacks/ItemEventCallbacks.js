/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const ItemEventRouter = require("../routers/ItemEventRouter");

class ItemEventCallbacks
{
    static handleEvents(url, info, sessionID)
    {
        return https_f.response.getBody(ItemEventRouter.handleEvents(info, sessionID));
    }
}

module.exports = ItemEventCallbacks;
