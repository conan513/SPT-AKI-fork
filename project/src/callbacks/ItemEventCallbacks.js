/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class ItemEventCallbacks
{
    static handleEvents(url, info, sessionID)
    {
        return https_f.response.getBody(item_f.eventHandler.handleEvents(info, sessionID));
    }
}

module.exports = ItemEventCallbacks;
