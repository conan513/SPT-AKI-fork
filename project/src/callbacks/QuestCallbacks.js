/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

class QuestCallbacks
{
    constructor()
    {
        https_f.router.onStaticRoute["/client/quest/list"] = this.listQuests.bind(this);
        item_f.eventHandler.addEvent("QuestAccept", "Aki", this.acceptQuest.bind(this));
        item_f.eventHandler.addEvent("QuestComplete", "Aki", this.completeQuest.bind(this));
        item_f.eventHandler.addEvent("QuestHandover", "Aki", this.handoverQuest.bind(this));
    }

    acceptQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.acceptQuest(pmcData, body, sessionID);
    }

    completeQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.completeQuest(pmcData, body, sessionID);
    }

    handoverQuest(pmcData, body, sessionID)
    {
        return quest_f.controller.handoverQuest(pmcData, body, sessionID);
    }

    listQuests(url, info, sessionID)
    {
        return https_f.response.getBody(quest_f.controller.getClientQuests(sessionID));
    }
}

module.exports = new QuestCallbacks();
