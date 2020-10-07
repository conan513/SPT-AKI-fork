/* image.js
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
        server_f.server.addRespondCallback("IMAGE", this.sendImage.bind());
        router_f.router.addDynamicRoute(".jpg", this.getImage.bind());
        router_f.router.addDynamicRoute(".png", this.getImage.bind());
    }

    getImage(url, info, sessionID)
    {
        return "IMAGE";
    }

    sendImage(sessionID, req, resp, body)
    {
        let splittedUrl = req.url.split("/");
        let fileName = splittedUrl[splittedUrl.length - 1].split(".").slice(0, -1).join(".");
        let baseNode = {};

        // get images to look through
        if (req.url.includes("/quest"))
        {
            logger.logInfo("[IMG.quests]:" + req.url);
            baseNode = res.quest;
        }
        else if (req.url.includes("/handbook"))
        {
            logger.logInfo("[IMG.handbook]:" + req.url);
            baseNode = res.handbook;
        }
        else if (req.url.includes("/avatar"))
        {
            logger.logInfo("[IMG.trader]:" + req.url);
            baseNode = res.trader;
        }
        else if (req.url.includes("/banners"))
        {
            logger.logInfo("[IMG.banners]:" + req.url);
            baseNode = res.banners;
        }
        else
        {
            logger.logInfo("[IMG.hideout]:" + req.url);
            baseNode = res.hideout;
        }

        // send image
        server.sendFile(resp, baseNode[fileName]);
    }
}

module.exports.callbacks = new Callbacks();
