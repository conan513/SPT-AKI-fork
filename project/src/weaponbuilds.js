"use strict";

class WeaponBuildsController
{
    getUserBuilds(sessionID)
    {
        let userBuildsMap = json.parse(json.read(save_f.saveServer.getWeaponBuildPath(sessionID)));
        let userBuilds = [];

        for (let buildName in userBuildsMap)
        {
            userBuilds.push(userBuildsMap[buildName]);
        }

        return userBuilds;
    }

    saveBuild(pmcData, body, sessionID)
    {
        delete body.Action;
        body.id = utility.generateNewItemId();

        let output = item_f.itemServer.getOutput();
        let savedBuilds = json.parse(json.read(save_f.saveServer.getWeaponBuildPath(sessionID)));

        // replace duplicate ID's. The first item is the base item.
        // The root ID and the base item ID need to match.
        body.items = helpfunc_f.helpFunctions.replaceIDs(pmcData, body.items, false);
        body.root = body.items[0]._id;

        savedBuilds[body.name] = body;
        json.write(save_f.saveServer.getWeaponBuildPath(sessionID), savedBuilds);
        output.builds.push(body);
        return output;
    }

    removeBuild(pmcData, body, sessionID)
    {
        let savedBuilds = json.parse(json.read(save_f.saveServer.getWeaponBuildPath(sessionID)));

        for (let name in savedBuilds)
        {
            if (savedBuilds[name].id === body.id)
            {
                delete savedBuilds[name];
                json.write(save_f.saveServer.getWeaponBuildPath(sessionID), savedBuilds);
                break;
            }
        }

        return item_f.itemServer.getOutput();
    }
}

class WeaponBuildsCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/handbook/builds/my/list", this.getHandbookUserlist.bind());
        item_f.itemServer.addRoute("SaveBuild", this.saveBuild.bind());
        item_f.itemServer.addRoute("RemoveBuild", this.removeBuild.bind());
    }

    getHandbookUserlist(url, info, sessionID)
    {
        return response_f.responseController.getBody(weaponbuilds_f.weaponBuildsController.getUserBuilds(sessionID));
    }

    saveBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.weaponBuildsController.saveBuild(pmcData, body, sessionID);
    }

    removeBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.weaponBuildsController.removeBuild(pmcData, body, sessionID);
    }
}

module.exports.weaponBuildsController = new WeaponBuildsController();
module.exports.weaponBuildsCallbacks = new WeaponBuildsCallbacks();