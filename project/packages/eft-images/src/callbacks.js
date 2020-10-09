/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        server_f.server.respondCallback["IMAGE"] = this.sendImage.bind(this);
        router_f.router.dynamicRoutes[".jpg"] = this.getImage.bind(this);
        router_f.router.dynamicRoutes[".png"] = this.getImage.bind(this);
    }

    getImage(url, info, sessionID)
    {
        return "IMAGE";
    }

    sendImage(sessionID, req, resp, body)
    {
        let splittedUrl = req.url.split("/");
        let filename = splittedUrl[splittedUrl.length - 1].split(".").slice(0, -1).join(".");
        let filepath = "packages/eft-images/res/";

        // get images to look through
        if (req.url.includes("/quest"))
        {
            logger_f.instance.logInfo("[IMG.quests]:" + req.url);
            filepath += "quests";
        }
        else if (req.url.includes("/handbook"))
        {
            logger_f.instance.logInfo("[IMG.handbook]:" + req.url);
            filepath += "handbook";
        }
        else if (req.url.includes("/avatar"))
        {
            logger_f.instance.logInfo("[IMG.trader]:" + req.url);
            filepath += "traders";
        }
        else if (req.url.includes("banners"))
        {
            logger_f.instance.logInfo("[IMG.banners]:" + req.url);
            filepath += "banners";
        }
        else
        {
            logger_f.instance.logInfo("[IMG.hideout]:" + req.url);
            filepath += "hideout";
        }

        // send image
        server_f.server.sendFile(resp, `${filepath}/${filename}.png`);
    }
}

module.exports.Callbacks = Callbacks;
