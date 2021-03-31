/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");

class ItemEventCallbacks
{
    static handleEvents(url, info, sessionID)
    {
        return HttpResponse.getBody(ItemEventRouter.handleEvents(info, sessionID));
    }
}

module.exports = ItemEventCallbacks;
