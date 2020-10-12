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

class Controller
{
    constructor()
    {
        this.globalLootChanceModifier = 0;
    }

    /* Load all the locations into memory. */
    initialize()
    {
        this.globalLootChanceModifier = database_f.server.tables.globals.config.GlobalLootChanceModifier;
    }

    /* generates a random location preset to use for local session */
    generate(name)
    {
        let location = database_f.server.tables.locations[name];
        const locationLootChanceModifier = location.base.GlobalLootChanceModifier;
        let output = location.base;
        let ids = {};

        // don't generate loot on hideout
        if (name === "hideout")
        {
            return output;
        }

        let forced = location.loot.forced;
        let mounted = location.loot.mounted;
        let statics = location.loot.static;
        let dynamic = location.loot.dynamic;
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

            if (data.Items.length > 1)
                data.Items.splice(1);

            this.generateContainerLoot(data.Items);
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
            maxCount += 1;
            let rndLootIndex = common_f.utility.getRandomInt(0, dynamic.length - 1);
            let rndLoot = dynamic[rndLootIndex];

            if (!rndLoot.data)
            {
                maxCount -= 1;
                continue;
            }

            let rndLootTypeIndex = common_f.utility.getRandomInt(0, rndLoot.data.length - 1);
            let data = rndLoot.data[rndLootTypeIndex];

            //Check if LootItem is overlapping
            let position = data.Position.x + "," + data.Position.y + "," + data.Position.z;
            if (!location_f.config.allowLootOverlay && lootPositions.includes(position))
            {
                //Clear selected loot
                dynamic[rndLootIndex].data.splice(rndLootTypeIndex, 1);

                if (dynamic[rndLootIndex].data.length === 0)
                {
                    delete dynamic.splice(rndLootIndex, 1);
                }

                continue;
            }

            //random loot Id
            //TODO: To implement a new random function, use "generateID" instead for now.
            data.Id = common_f.utility.generateID();

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

                if (lootItemsByParentId[loot.parentId] === undefined)
                    lootItemsByParentId[loot.parentId] = [];
                lootItemsByParentId[loot.parentId].push(loot);
            }

            //reset itemId and childrenItemId
            for (const itemId of Object.keys(lootItemsHash))
            {
                let newId = common_f.utility.generateID();
                lootItemsHash[itemId]._id = newId;

                if (itemId === data.Root)
                    data.Root = newId;

                if (lootItemsByParentId[itemId] === undefined)
                    continue;

                for (const childrenItem of lootItemsByParentId[itemId])
                {
                    childrenItem.parentId = newId;
                }
            }

            const num = common_f.utility.getRandomInt(0, 100);
            const spawnChance = database_f.server.tables.templates.items[data.Items[0]._tpl]._props.SpawnChance;
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
        common_f.logger.logSuccess("A total of " + count + " items spawned");
        common_f.logger.logSuccess("Generated location " + name);
        return output;
    }

    /* get a location with generated loot data */
    get(location)
    {
        let name = location.toLowerCase().replace(" ", "");
        return common_f.json.stringify(this.generate(name));
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

        base.data.locations = data;
        return base.data;
    }

    generateContainerLoot(items)
    {
        let container = database_f.server.tables.loot.statics[items[0]._tpl];
        let parentId = items[0]._id;
        let idPrefix = parentId.substring(0, parentId.length - 4);
        let idSuffix = parseInt(parentId.substring(parentId.length - 4), 16) + 1;
        let container2D = Array(container.height).fill().map(() => Array(container.width).fill(0));
        let maxProbability = container.maxProbability;
        let minCount = container.minCount;

        for (let i = minCount; i < container.maxCount; i++)
        {
            let roll = common_f.utility.getRandomInt(0, 100);

            if (roll < container.chance)
            {
                minCount++;
            }
        }

        for (let i = 0; i < minCount; i++)
        {
            let item = {};
            let containerItem = {};
            let result = { success: false };
            let maxAttempts = 20;

            while (!result.success && maxAttempts)
            {
                let roll = common_f.utility.getRandomInt(0, maxProbability);
                let rolled = container.items.find(itm => itm.cumulativeChance >= roll);

                item = helpfunc_f.helpFunctions.clone(helpfunc_f.helpFunctions.getItem(rolled.id)[1]);

                if (rolled.preset)
                {
                    // Guns will need to load a preset of items
                    item._props.presetId = rolled.preset.id;
                    item._props.Width = rolled.preset.w;
                    item._props.Height = rolled.preset.h;
                }

                result = helpfunc_f.helpFunctions.findSlotForItem(container2D, item._props.Width, item._props.Height);
                maxAttempts--;
            }

            // if we weren't able to find an item to fit after 20 tries then container is probably full
            if (!result.success)
                break;

            container2D = helpfunc_f.helpFunctions.fillContainerMapWithItem(
                container2D, result.x, result.y, item._props.Width, item._props.Height, result.rotation);
            let rot = result.rotation ? 1 : 0;

            if (item._props.presetId)
            {
                // Process gun preset into container items
                let preset = helpfunc_f.helpFunctions.clone(preset_f.controller.getStandardPreset(item._id));
                preset._items[0].parentId = parentId;
                preset._items[0].slotId = "main";
                preset._items[0].location = { "x": result.x, "y": result.y, "r": rot};

                for (var p in preset._items)
                {
                    items.push(preset._items[p]);

                    if (preset._items[p].slotId === "mod_magazine")
                    {
                        let mag = helpfunc_f.helpFunctions.getItem(preset._items[p]._tpl)[1];
                        let cartridges = {
                            "_id": idPrefix + idSuffix.toString(16),
                            "_tpl": item._props.defAmmo,
                            "parentId": preset._items[p]._id,
                            "slotId": "cartridges",
                            "upd": { "StackObjectsCount": mag._props.Cartridges[0]._max_count }
                        };

                        items.push(cartridges);
                        idSuffix++;
                    }
                }

                continue;
            }

            containerItem = {
                "_id": idPrefix + idSuffix.toString(16),
                "_tpl": item._id,
                "parentId": parentId,
                "slotId": "main",
                "location": { "x": result.x, "y": result.y, "r": rot}
            };

            let cartridges;
            if (item._parent === "543be5dd4bdc2deb348b4569" || item._parent === "5485a8684bdc2da71d8b4567")
            {
                // Money or Ammo stack
                let stackCount = common_f.utility.getRandomInt(item._props.StackMinRandom, item._props.StackMaxRandom);
                containerItem.upd = { "StackObjectsCount": stackCount };
            }
            else if (item._parent === "543be5cb4bdc2deb348b4568")
            {
                // Ammo container
                idSuffix++;

                cartridges = {
                    "_id": idPrefix + idSuffix.toString(16),
                    "_tpl": item._props.StackSlots[0]._props.filters[0].Filter[0],
                    "parentId": containerItem._id,
                    "slotId": "cartridges",
                    "upd": { "StackObjectsCount": item._props.StackMaxRandom }
                };
            }
            else if (item._parent === "5448bc234bdc2d3c308b4569")
            {
                // Magazine
                idSuffix++;
                cartridges = {
                    "_id": idPrefix + idSuffix.toString(16),
                    "_tpl": item._props.Cartridges[0]._props.filters[0].Filter[0],
                    "parentId": parentId,
                    "slotId": "cartridges",
                    "upd": { "StackObjectsCount": item._props.Cartridges[0]._max_count }
                };
            }

            items.push(containerItem);
            if (cartridges)
            {
                items.push(cartridges);
            }
            idSuffix++;
        }
    }
}

module.exports.Controller = Controller;
