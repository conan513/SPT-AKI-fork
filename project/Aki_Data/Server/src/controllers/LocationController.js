/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 * - Craink
 */

"use strict";

class LocationController
{
    /* generates a random location preset to use for local session */
    generate(name)
    {
        let location = database_f.server.tables.locations[name];
        let output = location.base;
        let ids = {};

        output.UnixDateTime = common_f.time.getTimestamp();

        // don't generate loot on hideout
        if (name === "hideout")
        {
            return output;
        }

        // generate loot
        let forced = location.loot.forced;
        let mounted = location.loot.mounted;
        let statics = common_f.json.clone(location.loot.static);
        let dynamic = common_f.json.clone(location.loot.dynamic);
        output.Loot = [];

        // mounted weapons
        for (let i in mounted)
        {
            let data = mounted[i];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;
            output.Loot.push(data);
        }

        // forced loot
        for (let i in forced)
        {
            let data = forced[i].data[0];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;
            output.Loot.push(data);
        }

        let count = 0;
        // static loot
        for (let i in statics)
        {
            let data = statics[i];

            if (data.Id in ids)
                continue;

            ids[data.Id] = true;

            location_f.generator.generateContainerLoot(data.Items);
            output.Loot.push(data);
            count++;
        }
        common_f.logger.logSuccess("A total of " + count + " containers generated");

        // dyanmic loot
        let max = location_f.config.limits[name];
        count = 0;

        // Loot position list for filtering the lootItem in the same position.
        let lootPositions = [];
        let maxCount = 0;

        while (maxCount < max && dynamic.length > 0)
        {
            const result = location_f.generator.generateDynamicLoot(dynamic, lootPositions, location);

            if (result.status === "success")
            {
                count += 1;
                lootPositions.push(result.position);
                output.Loot.push(result.data);
            }
            else if (result.status === "error")
            {
                continue;
            }

            maxCount++;
        }

        // done generating
        common_f.logger.logSuccess("A total of " + count + " items spawned");
        common_f.logger.logSuccess("Generated location " + name);
        return output;
    }

    /* get a location with generated loot data */
    get(location)
    {
        let name = location.toLowerCase().replace(" ", "");
        return this.generate(name);
    }

    /* get all locations without loot data */
    generateAll()
    {
        let locations = database_f.server.tables.locations;
        let base = database_f.server.tables.locations.base;
        let data = {};

        // use right id's and strip loot
        for (let name in locations)
        {
            if (name === "base")
            {
                continue;
            }

            let map = locations[name].base;

            map.Loot = [];
            data[map._Id] = map;
        }

        base.locations = data;
        return base;
    }
}

module.exports.LocationController = LocationController;
