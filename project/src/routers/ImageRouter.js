/* image.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const VFS = require("../utils/VFS");
const HttpServer = require("../servers/HttpServer.js");

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
            HttpServer.sendFile(resp, ImageRouter.onRoute[url]);
        }
    }

    static getImage(url, info, sessionID)
    {
        return "IMAGE";
    }
}

module.exports = ImageRouter;
