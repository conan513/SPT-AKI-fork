/* HttpCallbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const ImageRouter = require("../routers/ImageRouter");
const HttpServer = require("../servers/HttpServer.js");

class HttpCallbacks
{
    static load()
    {
        HttpServer.load();
    }

    static sendImage(sessionID, req, resp, body)
    {
        ImageRouter.sendImage(sessionID, req, resp, body);
    }

    static getImage()
    {
        return ImageRouter.getImage();
    }
}

module.exports = HttpCallbacks;
