/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");

class QuestCallbacks
{
    static acceptQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.acceptQuest(pmcData, body, sessionID);
    }

    static completeQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.completeQuest(pmcData, body, sessionID);
    }

    static handoverQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.handoverQuest(pmcData, body, sessionID);
    }

    static listQuests(url, info, sessionID)
    {
        return HttpResponse.getBody(quest_f.controller.getClientQuests(sessionID));
    }
}

module.exports = QuestCallbacks;
