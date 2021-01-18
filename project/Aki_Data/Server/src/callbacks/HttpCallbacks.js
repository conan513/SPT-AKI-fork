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
    constructor()
    {
        core_f.packager.onLoad["aki-https"] = this.load.bind(this);
    }

    load()
    {
        // load server
        https_f.server.load();

        // add server and router callbacks
        https_f.server.onRespond["IMAGE"] = this.sendImage.bind(this);
        https_f.router.onDynamicRoute[".jpg"] = this.getImage.bind(this);
        https_f.router.onDynamicRoute[".png"] = this.getImage.bind(this);
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

module.exports.HttpCallbacks = HttpCallbacks;
