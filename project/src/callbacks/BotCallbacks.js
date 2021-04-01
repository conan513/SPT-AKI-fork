/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");
const BotController = require("../controllers/BotController.js");

class BotCallbacks
{
    static getBotLimit(url, info, sessionID)
    {
        const splittedUrl = url.split("/");
        const type = splittedUrl[splittedUrl.length - 1];
        return HttpResponse.noBody(BotController.getBotLimit(type));
    }

    static getBotDifficulty(url, info, sessionID)
    {
        const splittedUrl = url.split("/");
        const type = splittedUrl[splittedUrl.length - 2].toLowerCase();
        const difficulty = splittedUrl[splittedUrl.length - 1];
        return HttpResponse.noBody(BotController.getBotDifficulty(type, difficulty));
    }

    static generateBots(url, info, sessionID)
    {
        return HttpResponse.getBody(BotController.generate(info));
    }
}

module.exports = BotCallbacks;
