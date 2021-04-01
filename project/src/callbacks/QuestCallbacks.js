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
const QuestController = require("../controllers/QuestController.js");

class QuestCallbacks
{
    static acceptQuest(pmcData, body, sessionID)
    {
        return QuestController.acceptQuest(pmcData, body, sessionID);
    }

    static completeQuest(pmcData, body, sessionID)
    {
        return QuestController.completeQuest(pmcData, body, sessionID);
    }

    static handoverQuest(pmcData, body, sessionID)
    {
        return QuestController.handoverQuest(pmcData, body, sessionID);
    }

    static listQuests(url, info, sessionID)
    {
        return HttpResponse.getBody(QuestController.getClientQuests(sessionID));
    }
}

module.exports = QuestCallbacks;
