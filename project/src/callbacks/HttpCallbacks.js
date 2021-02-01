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
    load()
    {
        https_f.server.load();        
    }

    sendImage(sessionID, req, resp, body)
    {
        https_f.image.sendImage(sessionID, req, resp, body);
    }

    getImage()
    {
        return https_f.image.getImage();
    }
}

module.exports = new HttpCallbacks();
