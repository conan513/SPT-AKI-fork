/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class BotCallbacks
{
    getBotLimit(url, info, sessionID)
    {
        const splittedUrl = url.split("/");
        const type = splittedUrl[splittedUrl.length - 1];
        return https_f.response.noBody(bots_f.controller.getBotLimit(type));
    }

    getBotDifficulty(url, info, sessionID)
    {
        const splittedUrl = url.split("/");
        const type = splittedUrl[splittedUrl.length - 2].toLowerCase();
        const difficulty = splittedUrl[splittedUrl.length - 1];
        return https_f.response.noBody(bots_f.controller.getBotDifficulty(type, difficulty));
    }

    generateBots(url, info, sessionID)
    {
        return https_f.response.getBody(bots_f.controller.generate(info));
    }
}

module.exports = new BotCallbacks();
