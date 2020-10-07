/* weaponbuilds.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class Controller
{
    onLoad(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        if (!("weaponbuilds" in profile))
        {
            profile.weaponbuilds = {};
        }

        return profile;
    }

    getUserBuilds(sessionID)
    {
        return Object.values(save_f.server.profiles[sessionID].weaponbuilds);
    }

    saveBuild(pmcData, body, sessionID)
    {
        delete body.Action;
        body.id = utility.generateNewItemId();

        let output = item_f.router.getOutput();
        let savedBuilds = save_f.server.profiles[sessionID].weaponbuilds;

        // replace duplicate ID's. The first item is the base item.
        // The root ID and the base item ID need to match.
        body.items = helpfunc_f.helpFunctions.replaceIDs(pmcData, body.items, false);
        body.root = body.items[0]._id;

        savedBuilds[body.name] = body;
        save_f.server.profiles[sessionID].weaponbuilds = savedBuilds;

        output.builds.push(body);
        return output;
    }

    removeBuild(pmcData, body, sessionID)
    {
        let savedBuilds = save_f.server.profiles[sessionID].weaponbuilds;

        for (let name in savedBuilds)
        {
            if (savedBuilds[name].id === body.id)
            {
                delete savedBuilds[name];
                save_f.server.profiles[sessionID].weaponbuilds = savedBuilds;
                break;
            }
        }

        return item_f.router.getOutput();
    }
}

class callbacks
{
    constructor()
    {
        save_f.server.onLoadCallback["weaponbuilds"] = this.onLoad.bind();

        router_f.router.addStaticRoute("/client/handbook/builds/my/list", this.getHandbookUserlist.bind());
        item_f.router.addRoute("SaveBuild", this.saveBuild.bind());
        item_f.router.addRoute("RemoveBuild", this.removeBuild.bind());
    }

    onLoad(sessionID)
    {
        return weaponbuilds_f.controller.onLoad(sessionID);
    }

    getHandbookUserlist(url, info, sessionID)
    {
        return response_f.controller.getBody(weaponbuilds_f.controller.getUserBuilds(sessionID));
    }

    saveBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.controller.saveBuild(pmcData, body, sessionID);
    }

    removeBuild(pmcData, body, sessionID)
    {
        return weaponbuilds_f.controller.removeBuild(pmcData, body, sessionID);
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new callbacks();