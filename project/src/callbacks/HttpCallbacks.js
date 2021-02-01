/* HttpCallbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HttpCallbacks
{
    static load()
    {
        https_f.server.load();        
    }

    static sendImage(sessionID, req, resp, body)
    {
        https_f.image.sendImage(sessionID, req, resp, body);
    }

    static getImage()
    {
        return https_f.image.getImage();
    }
}

module.exports = HttpCallbacks;
