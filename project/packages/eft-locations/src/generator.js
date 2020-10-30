/* generator.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 * - Craink
 */

"use strict";

class Generator
{
    generateDynamicLoot(dynamic, lootPositions, location)
    {
        let rndLootIndex = common_f.random.getInt(0, dynamic.length - 1);
        let rndLoot = dynamic[rndLootIndex];

        if (!rndLoot.data)
        {
            delete dynamic.splice(rndLootIndex, 1);
            return { "result": "error" };
        }

        let rndLootTypeIndex = common_f.random.getInt(0, rndLoot.data.length - 1);
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

            return { "status": "error" };
        }

        //random loot Id
        data.Id = common_f.hash.generate();

        //create lootItem list
        let lootItemsHash = {};
        let lootItemsByParentId = {};

        for (const i in data.Items)
        {
            // Check for the item spawnchance
            let loot = data.Items[i];
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
            let newId = common_f.hash.generate();
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

        const globalLootChanceModifier = database_f.server.tables.globals.config.GlobalLootChanceModifier;
        const locationLootChanceModifier = location.base.GlobalLootChanceModifier;
        const num = common_f.random.getInt(0, 100);
        const spawnChance = database_f.server.tables.templates.items[data.Items[0]._tpl]._props.SpawnChance;
        const itemChance = (spawnChance * globalLootChanceModifier * locationLootChanceModifier).toFixed(0);

        if (itemChance >= num)
        {
            return { "status": "success", "data": data, "position": position };
        }
        
        return { "status": "fail" };
    }

    generateContainerLoot(items)
    {
        let container = common_f.json.clone(database_f.server.tables.loot.statics[items[0]._tpl]);
        let parentId = items[0]._id;
        let idPrefix = parentId.substring(0, parentId.length - 4);
        let idSuffix = parseInt(parentId.substring(parentId.length - 4), 16) + 1;
        let container2D = Array(container.height).fill().map(() => Array(container.width).fill(0));
        let minCount = container.minCount;


        // Spawn any forced items first
        for (let i = 1; i < items.length; i++)
        {
            const item = helpfunc_f.helpFunctions.getItem(items[i]._tpl)[1];

            container2D = helpfunc_f.helpFunctions.fillContainerMapWithItem(
                container2D, items[i].location.x, items[i].location.y, item._props.Width, item._props.Height, items[i].location.r);
        }

        for (let i = minCount; i < container.maxCount; i++)
        {
            let roll = common_f.random.getInt(0, 100);

            if (roll < container.chance)
            {
                minCount++;
            }
        }

        for (let i = 0; i < minCount; i++)
        {
            let item = {};
            let containerItem = {};
            let rolledIndex = 0;
            let result = { success: false };
            let maxAttempts = 20;
            let maxProbability = container.items[container.items.length - 1].cumulativeChance;

            while (!result.success && maxAttempts)
            {
                let roll = common_f.random.getInt(0, maxProbability);
                rolledIndex = container.items.findIndex(itm => itm.cumulativeChance >= roll);
                const rolled = container.items[rolledIndex];
                item = common_f.json.clone(helpfunc_f.helpFunctions.getItem(rolled.id)[1]);

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
                let preset = common_f.json.clone(preset_f.controller.getStandardPreset(item._id));
                preset._items[0].parentId = parentId;
                preset._items[0].slotId = "main";
                preset._items[0].location = { "x": result.x, "y": result.y, "r": rot };

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

                // Don't spawn the same weapon more than once
                container.items.splice(rolledIndex, 1);
                continue;
            }

            containerItem = {
                "_id": idPrefix + idSuffix.toString(16),
                "_tpl": item._id,
                "parentId": parentId,
                "slotId": "main",
                "location": { "x": result.x, "y": result.y, "r": rot }
            };


            if (item._parent !== "543be5dd4bdc2deb348b4569")
            {
                // Don't spawn the same item more than once (apart from money stacks)
                container.items.splice(rolledIndex, 1);
            }

            let cartridges;
            if (item._parent === "543be5dd4bdc2deb348b4569" || item._parent === "5485a8684bdc2da71d8b4567")
            {
                // Money or Ammo stack
                let stackCount = common_f.random.getInt(item._props.StackMinRandom, item._props.StackMaxRandom);
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
                    "parentId": containerItem._id,
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

module.exports.Generator = Generator;