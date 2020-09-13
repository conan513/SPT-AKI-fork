"use strict";

function execute(sessionID)
{
    if (!account_f.accountServer.isWiped(sessionID))
    {
        updateTraders(sessionID);
        hideout_f.hideoutController.updatePlayerHideout(sessionID);
    }

    return {"msg": "OK"};
}

function updateTraders(sessionID)
{
    // update each hour
    let update_per = 3600;
    let timeNow = Math.floor(Date.now() / 1000);
    let tradersToUpdateList = trader_f.traderServer.getAllTraders(sessionID);

    dialogue_f.dialogueServer.removeExpiredItems(sessionID);

    for (let i = 0; i < tradersToUpdateList.length; i++)
    {
        if ((tradersToUpdateList[i].supply_next_time + update_per) > timeNow)
        {
            continue;
        }

        // update restock timer
        let substracted_time = timeNow - tradersToUpdateList[i].supply_next_time;
        let days_passed = Math.floor((substracted_time) / 86400);
        let time_co_compensate = days_passed * 86400;
        let newTraderTime = tradersToUpdateList[i].supply_next_time + time_co_compensate;
        let compensateUpdate_per = Math.floor((timeNow - newTraderTime) / update_per);

        compensateUpdate_per = compensateUpdate_per * update_per;
        newTraderTime = newTraderTime + compensateUpdate_per + update_per;
        tradersToUpdateList[i].supply_next_time = newTraderTime;
    }
}

class KeepAliveCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/keepalive", this.execute.bind());
    }

    execute(url, info, sessionID)
    {
        return response_f.getBody(execute(sessionID));
    }
}

module.exports.KeepAliveCallbacks = new KeepAliveCallbacks();
