"use strict";

/* LocationServer class maintains list of locations in memory. */
class LocationServer
{
    constructor()
    {
        this.locations = {};
        this.lootPresets = {};
    }

    /* Load all the locations into memory. */
    initialize()
    {
        for (let name in db.locations)
        {
            if (name === "base")
            {
                continue;
            }

            let node = db.locations[name];
            let location = json.parse(json.read(node.base));

            // set infill locations
            for (let entry in node.entries)
            {
                location.SpawnAreas.push(json.parse(json.read(node.entries[entry])));
            }

            // set exfill locations
            for (let exit in node.exits)
            {
                location.exits.push(json.parse(json.read(node.exits[exit])));
            }

            // set scav locations
            for (let wave in node.waves)
            {
                location.waves.push(json.parse(json.read(node.waves[wave])));
            }

            // set boss locations
            for (let spawn in node.bosses)
            {
                location.BossLocationSpawn.push(json.parse(json.read(node.bosses[spawn])));
            }

            let presets;
            if (node.loot_file)
            {
                presets = json.parse(json.read(node.loot_file)).Loot;
            }

            this.locations[name] = location;
            this.lootPresets[name] = presets;
        }
    }

    /* generates a random location preset to use for local session */
    generate(name)
    {
        let output = this.locations[name];
        let presets = this.lootPresets[name];
        let ids = {};

        // don't generate loot on hideout
        if (name === "hideout")
        {
            return output;
        }

        let forced = {};
        let statics = {};
        let dynamic = {};
        output.Loot = [];

        for (let i in presets)
        {
            switch (presets[i].Type)
            {
                case "Forced":
                    forced = presets[i].LootList;
                    break;
                case "Static":
                    statics = presets[i].LootList;
                    break;
                case "Dynamic":
                    dynamic = presets[i].LootList;
                    break;
            }
        }

        // forced loot
        for (let i in forced)
        {
            let data = forced[i].Data[0];
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
            let dataLength = statics[i].Data.length;
            let data = statics[i].Data[utility.getRandomInt(0, dataLength - 1)];

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

            if (!rndLoot.Data)
            {
                maxCount -= 1;
                continue;
            }

            let rndLootTypeIndex = utility.getRandomInt(0, rndLoot.Data.length - 1);
            let data = rndLoot.Data[rndLootTypeIndex];

            //Check if LootItem is overlapping
            let position = data.Position.x + "," + data.Position.y + "," + data.Position.z;
            if (!gameplayConfig.locationloot.allowLootOverlay && lootPositions.includes(position))
            {
                //Clearly selected loot
                dynamic[rndLootIndex].Data.splice(rndLootTypeIndex, 1);

                if (dynamic[rndLootIndex].Data.length == 0)
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
            const itemChance = (database_f.database.tables.templates.items[data.Items[0]._tpl]._props.SpawnChance * database_f.database.tables.globals.config.GlobalLootChanceModifier * location_f.locationServer.locations[name].GlobalLootChanceModifier).toFixed(0);
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
        let base = json.parse(json.read(db.locations.base));
        let data = {};

        // use right id's and strip loot
        for (let name in this.locations)
        {
            let map = this.locations[name];

            map.Loot = [];
            data[this.locations[name]._Id] = map;
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
