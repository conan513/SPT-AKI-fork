"use strict";

class WeaponBuildsController
{
    onLoad(profile)
    {
        profile.weaponbuilds = profile.weaponbuilds || {};
        return profile;
    }

    getUserBuilds(sessionID)
    {
        return Object.values(save_f.saveServer.profiles[sessionID].weaponbuilds);
    }

    saveBuild(pmcData, body, sessionID)
    {
        delete body.Action;
        body.id = utility.generateNewItemId();

        let output = item_f.itemServer.getOutput();
        let savedBuilds = save_f.saveServer.profiles[sessionID].weaponbuild;

        // replace duplicate ID's. The first item is the base item.
        // The root ID and the base item ID need to match.
        body.items = helpfunc_f.helpFunctions.replaceIDs(pmcData, body.items, false);
        body.root = body.items[0]._id;

        savedBuilds[body.name] = body;
        save_f.saveServer.profiles[sessionID].weaponbuilds = savedBuilds;

        output.builds.push(body);
        return output;
    }

    removeBuild(pmcData, body, sessionID)
    {
        let savedBuilds = save_f.saveServer.profiles[sessionID].weaponbuilds;

        for (let name in savedBuilds)
        {
            if (savedBuilds[name].id === body.id)
            {
                delete savedBuilds[name];
                save_f.saveServer.profiles[sessionID].weaponbuilds = savedBuilds;
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
        save_f.saveServer.onLoadCallback["weaponbuilds"] = this.onLoad.bind();

        router.addStaticRoute("/client/handbook/builds/my/list", this.getHandbookUserlist.bind());
        item_f.itemServer.addRoute("SaveBuild", this.saveBuild.bind());
        item_f.itemServer.addRoute("RemoveBuild", this.removeBuild.bind());
    }

    
    onLoad(profile)
    {
        return weaponbuilds_f.weaponBuildsController.onLoad(profile);
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