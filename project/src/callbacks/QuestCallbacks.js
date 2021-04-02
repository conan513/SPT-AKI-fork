"use strict";

require("../Lib.js");

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
