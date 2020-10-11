/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

class Callbacks
{
    constructor()
    {
        router_f.router.staticRoutes["/client/quest/list"] = this.listQuests.bind(this);
        item_f.router.routes["QuestAccept"] = this.acceptQuest.bind(this);
        item_f.router.routes["QuestComplete"] = this.completeQuest.bind(this);
        item_f.router.routes["QuestHandover"] = this.handoverQuest.bind(this);
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
        return response_f.controller.getBody(quest_f.controller.getVisibleQuests(url, info, sessionID));
    }
}

module.exports.Callbacks = Callbacks;
