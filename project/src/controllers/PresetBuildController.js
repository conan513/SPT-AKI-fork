/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

const ItemEventRouter = require("../routers/ItemEventRouter");

class PresetBuildController
{
    getUserBuilds(sessionID)
    {
        return Object.values(save_f.server.profiles[sessionID].weaponbuilds);
    }

    /**
     * @param {UserPMCProfile} pmcData
     * @param {{ Action: any; id: string; items: { _id: any; }[]; root: any; name: string | number; }} body
     * @param {string} sessionID
     */
    saveBuild(pmcData, body, sessionID)
    {
        delete body.Action;
        body.id = HashUtil.generate();

        let output = ItemEventRouter.getOutput();
        let savedBuilds = save_f.server.profiles[sessionID].weaponbuilds;

        // replace duplicate ID's. The first item is the base item.
        // The root ID and the base item ID need to match.
        body.items = Helpers.replaceIDs(pmcData, body.items, false);
        body.root = body.items[0]._id;

        savedBuilds[body.name] = body;
        save_f.server.profiles[sessionID].weaponbuilds = savedBuilds;

        output.builds.push(body);
        return output;
    }

    /**
     * @param {UserPMCProfile} pmcData
     * @param {RequestBody} body
     * @param {string} sessionID
     */
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

        return ItemEventRouter.getOutput();
    }
}

module.exports = new PresetBuildController();
