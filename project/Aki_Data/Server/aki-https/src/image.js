/* image.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class ImageHandler
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
        if (url in this.onRoute)
        {
            https_f.server.sendFile(resp, this.onRoute[url]);
        }
    }

    getImage(url, info, sessionID)
    {
        return "IMAGE";
    }
}

module.exports.ImageHandler = ImageHandler;
