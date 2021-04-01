"use strict";

require("../Lib.js");

class PresetBuildController
{
    static getUserBuilds(sessionID)
    {
        return Object.values(SaveServer.profiles[sessionID].weaponbuilds);
    }

    static saveBuild(pmcData, body, sessionID)
    {
        delete body.Action;
        body.id = HashUtil.generate();

        let output = ItemEventRouter.getOutput();
        let savedBuilds = SaveServer.profiles[sessionID].weaponbuilds;

        // replace duplicate ID's. The first item is the base item.
        // The root ID and the base item ID need to match.
        body.items = PlzRefactorMeHelper.replaceIDs(pmcData, body.items, false);
        body.root = body.items[0]._id;

        savedBuilds[body.name] = body;
        SaveServer.profiles[sessionID].weaponbuilds = savedBuilds;

        output.builds.push(body);
        return output;
    }

    static removeBuild(pmcData, body, sessionID)
    {
        let savedBuilds = SaveServer.profiles[sessionID].weaponbuilds;

        for (let name in savedBuilds)
        {
            if (savedBuilds[name].id === body.id)
            {
                delete savedBuilds[name];
                SaveServer.profiles[sessionID].weaponbuilds = savedBuilds;
                break;
            }
        }

        return ItemEventRouter.getOutput();
    }
}

module.exports = PresetBuildController;
