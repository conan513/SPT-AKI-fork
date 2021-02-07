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
    static onRoute = {};

    static sendImage(sessionID, req, resp, body)
    {
        // remove file extension
        const url = VFS.stripExtension(req.url);

        // send image
        if (ImageRouter.onRoute[url])
        {
            https_f.server.sendFile(resp, ImageRouter.onRoute[url]);
        }
    }

    static getImage(url, info, sessionID)
    {
        return "IMAGE";
    }
}

module.exports = ImageRouter;
