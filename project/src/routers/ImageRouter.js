/* image.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class ImageRouter
{
    constructor()
    {
        this.onRoute = {};
    }

    sendImage(sessionID, req, resp, body)
    {
        // remove file extension
        const url = req.url.split(".").slice(0, -1).join(".");

        // send image
        if (this.onRoute[url])
        {
            https_f.server.sendFile(resp, this.onRoute[url]);
        }
    }

    getImage(url, info, sessionID)
    {
        return "IMAGE";
    }
}

module.exports = new ImageRouter();
