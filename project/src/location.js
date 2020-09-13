"use strict";

/* LocationServer class maintains list of locations in memory. */
class LocationServer
{
    constructor()
    {
        this.globalLootChanceModifier = 0;
    }

    /* Load all the locations into memory. */
    initialize()
    {
        this.globalLootChanceModifier = database_f.database.tables.globals.config.GlobalLootChanceModifier;
    }

    /* generates a random location preset to use for local session */
    generate(name)
    {
        let location = database_f.database.tables.locations[name];
        const locationLootChanceModifier = location.base.GlobalLootChanceModifier;
        let output = location.base;
        let ids = {};

        // don't generate loot on hideout
        if (name === "hideout")
        {
            return output;
        }

        let forced = location.loot.Forced;
        let statics = location.loot.Static;
        let dynamic = location.loot.Dynamic;
        output.Loot = [];

        // forced loot
        for (let i in forced)
        {
            let data = forced[i].data[0];
            if (data.Id in ids)
            {
                continue;
            }
            else
            {
                ids[data.Id] = true;
            }

            output.Loot.push(data);
        }

        // static loot
        for (let i in statics)
        {
            let dataLength = statics[i].data.length;
            let data = statics[i].data[utility.getRandomInt(0, dataLength - 1)];

            if (data.Id in ids)
            {
                continue;
            }
            else
            {
                ids[data.Id] = true;
            }
            output.Loot.push(data);
        }

        // dyanmic loot
        let max = gameplayConfig.locationloot[name];
        let count = 0;

        // Loot position list for filtering the lootItem in the same position.
        let lootPositions = [];
        let maxCount = 0;

        while (maxCount < max && dynamic.length > 0)
        {
            maxCount += 1;
            let rndLootIndex = utility.getRandomInt(0, dynamic.length - 1);
            let rndLoot = dynamic[rndLootIndex];

            if (!rndLoot.data)
            {
                maxCount -= 1;
                continue;
            }

            let rndLootTypeIndex = utility.getRandomInt(0, rndLoot.data.length - 1);
            let data = rndLoot.data[rndLootTypeIndex];

            //Check if LootItem is overlapping
            let position = data.Position.x + "," + data.Position.y + "," + data.Position.z;
            if (!gameplayConfig.locationloot.allowLootOverlay && lootPositions.includes(position))
            {
                //Clear selected loot
                dynamic[rndLootIndex].data.splice(rndLootTypeIndex, 1);

                if (dynamic[rndLootIndex].data.length == 0)
                {
                    delete dynamic.splice(rndLootIndex, 1);
                }

                continue;
            }

            //random loot Id
            //TODO: To implement a new random function, use "generateNewItemId" instead for now.
            data.Id = utility.generateNewItemId();

            //create lootItem list
            let lootItemsHash = {};
            let lootItemsByParentId = {};

            for (const i in data.Items)
            {

                let loot = data.Items[i];
                // Check for the item spawnchance
                lootItemsHash[loot._id] = loot;

                if (!("parentId" in loot))
                    continue;

                if (lootItemsByParentId[loot.parentId] == undefined)
                    lootItemsByParentId[loot.parentId] = [];
                lootItemsByParentId[loot.parentId].push(loot);
            }

            //reset itemId and childrenItemId
            for (const itemId of Object.keys(lootItemsHash))
            {
                let newId = utility.generateNewItemId();
                lootItemsHash[itemId]._id = newId;

                if (itemId == data.Root)
                    data.Root = newId;

                if (lootItemsByParentId[itemId] == undefined)
                    continue;

                for (const childrenItem of lootItemsByParentId[itemId])
                {
                    childrenItem.parentId = newId;
                }
            }

            const num = utility.getRandomInt(0, 100);
            const spawnChance = database_f.database.tables.templates.items[data.Items[0]._tpl]._props.SpawnChance;
            const itemChance = (spawnChance * this.globalLootChanceModifier * locationLootChanceModifier).toFixed(0);
            if (itemChance >= num)
            {
                count += 1;
                lootPositions.push(position);
                output.Loot.push(data);
            }
            else
            {
                continue;
            }
        }

        // done generating
        logger.logSuccess("A total of " + count + " items spawned");
        logger.logSuccess("Generated location " + name);
        return output;
    }

    /* get a location with generated loot data */
    get(location)
    {
        let name = location.toLowerCase().replace(" ", "");
        return json.stringify(this.generate(name));
    }

    /* get all locations without loot data */
    generateAll()
    {
        let locations = database_f.database.tables.locations;
        let base = database_f.database.tables.locations.base;
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

        base.data.locations = data;
        return base.data;
    }
}

class LocationCallbacks
{
    constructor()
    {
        server.addStartCallback("loadLocations", this.load.bind());
        router.addStaticRoute("/client/locations", this.getLocationData.bind());
        router.addDynamicRoute("/api/location", this.getLocation.bind());
    }

    load()
    {
        location_f.locationServer.initialize();
    }

    getLocationData(url, info, sessionID)
    {
        return response_f.getBody(location_f.locationServer.generateAll());
    }

    getLocation(url, info, sessionID)
    {
        return location_f.locationServer.get(url.replace("/api/location/", ""));
    }
}

module.exports.locationServer = new LocationServer();
module.exports.locationCallbacks = new LocationCallbacks();
