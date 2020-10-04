/* bots.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */

"use strict";

class BotController
{
    constructor()
    {
        this.limitSettings = {};
        this.pmcSettings = {};
    }

    getBotLimit(type)
    {
        if (type === "cursedAssault" || type === "assaultGroup")
        {
            type = "assault";
        }

        return bots_f.botConfig.limits[type];
    }

    getBotDifficulty(type, difficulty)
    {
        switch (type)
        {
            case "core":
                return database_f.database.tables.bots.globalDifficulty;

            case "cursedassault":
                type = "assault";
                break;

            case "test":
            case "assaultgroup":
            case "followergluharsnipe":
            case "bosstest":
            case "followertest":
                /* unused bots by BSG, might have use */
                type = "pmcbot";
                break;

            default:
                break;
        }

        return database_f.database.tables.bots.type[type].difficulty[difficulty];
    }

    generateBot(bot, role, sessionID)
    {
        const pmcSettings = bots_f.botConfig.pmcSpawn;
        let type = (role === "cursedAssault") ? "assault" : role;

        // chance to spawn simulated PMC AIs
        if ((type === "assault" || type === "pmcBot") && pmcSettings.enabled)
        {
            const spawnChance = utility.getRandomInt(0, 99);
            const sideChance = utility.getRandomInt(0, 99);

            if (spawnChance < pmcSettings.spawnChance)
            {
                if (sideChance < pmcSettings.usecChance)
                {
                    bot.Info.Side = "Usec";
                    type = "usec";
                }
                else
                {
                    bot.Info.Side = "Bear";
                    type = "bear";
                }
            }
        }

        // we don't want player scav to be generated as PMC
        if (role === "playerScav")
        {
            type = "assault";
        }

        // generate bot
        const node = database_f.database.tables.bots.type[type.toLowerCase()];
        const levelResult = this.generateRandomLevel(node.experience.level.min, node.experience.level.max);

        bot.Info.Settings.Role = role;
        bot.Info.Nickname = utility.getRandomArrayValue(node.names);
        bot.Info.experience = levelResult.exp;
        bot.Info.Level = levelResult.level;
        bot.Info.Settings.Experience = utility.getRandomInt(node.experience.reward.min, node.experience.reward.max);
        bot.Info.Voice = utility.getRandomArrayValue(node.appearance.voice);
        bot.Health = this.generateHealth(node.health);
        bot.Customization.Head = utility.getRandomArrayValue(node.appearance.head);
        bot.Customization.Body = utility.getRandomArrayValue(node.appearance.body);
        bot.Customization.Feet = utility.getRandomArrayValue(node.appearance.feet);
        bot.Customization.Hands = utility.getRandomArrayValue(node.appearance.hands);
        //bot.Inventory = this.getInventoryTemp(type.toLowerCase());
        bot.Inventory = bots_f.botGenerator.generateInventory(node.inventory, node.chances, node.generation);

        // add dogtag to PMC's
        if (type === "usec" || type === "bear")
        {
            bot = this.generateDogtag(bot);
        }

        // generate new inventory ID
        bot = helpfunc_f.helpFunctions.generateInventoryID(bot);

        return bot;
    }

    generate(info, sessionID)
    {
        let generatedBots = [];

        for (const condition of info.conditions)
        {
            for (let i = 0; i < condition.Limit; i++)
            {
                let bot = json.parse(json.stringify(database_f.database.tables.bots.base));
                let botId = utility.getRandomIntEx(99999999);

                bot._id = "bot" + botId;
                bot.aid = botId;
                bot.Info.Settings.BotDifficulty = condition.Difficulty;
                bot = this.generateBot(bot, condition.Role, sessionID);
                generatedBots.unshift(bot);
            }
        }

        return generatedBots;
    }

    generateRandomLevel(min = 1, max = 70)
    {
        let exp = 0;
        let expTable = database_f.database.tables.globals.config.exp.level.exp_table;

        const maxLevel = Math.min(max, expTable.length);

        // Get random level based on the exp table.
        let level = utility.getRandomInt(min, maxLevel);

        for (let i = 0; i < level; i++)
        {
            exp += expTable[i].exp;
        }

        // Sprinkle in some random exp within the level, unless we are at max level.
        if (level < expTable.length - 1)
        {
            exp += utility.getRandomInt(0, expTable[level].exp - 1);
        }

        return {level, exp};
    }

    /** Converts health object to the required format */
    generateHealth(healthObj)
    {
        return {
            "Hydration": {
                "Current": utility.getRandomInt(healthObj.Hydration.min, healthObj.Hydration.max),
                "Maximum": healthObj.Hydration.max
            },
            "Energy": {
                "Current": utility.getRandomInt(healthObj.Energy.min, healthObj.Energy.max),
                "Maximum": healthObj.Energy.max
            },
            "BodyParts": {
                "Head": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.Head.min, healthObj.BodyParts.Head.max),
                        "Maximum": healthObj.BodyParts.Head.max
                    }
                },
                "Chest": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.Chest.min, healthObj.BodyParts.Chest.max),
                        "Maximum": healthObj.BodyParts.Chest.max
                    }
                },
                "Stomach": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.Stomach.min, healthObj.BodyParts.Stomach.max),
                        "Maximum": healthObj.BodyParts.Stomach.max
                    }
                },
                "LeftArm": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.LeftArm.min, healthObj.BodyParts.LeftArm.max),
                        "Maximum": healthObj.BodyParts.LeftArm.max
                    }
                },
                "RightArm": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.RightArm.min, healthObj.BodyParts.RightArm.max),
                        "Maximum": healthObj.BodyParts.RightArm.max
                    }
                },
                "LeftLeg": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.LeftLeg.min, healthObj.BodyParts.LeftLeg.max),
                        "Maximum": healthObj.BodyParts.LeftLeg.max
                    }
                },
                "RightLeg": {
                    "Health": {
                        "Current": utility.getRandomInt(healthObj.BodyParts.RightLeg.min, healthObj.BodyParts.RightLeg.max),
                        "Maximum": healthObj.BodyParts.RightLeg.max
                    }
                }
            }
        };
    }

    generateDogtag(bot)
    {
        const dogtagItem = {
            _id: utility.generateNewItemId(),
            _tpl: ((bot.Info.Side === "Usec") ? "59f32c3b86f77472a31742f0" : "59f32bb586f774757e1e8442"),
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            upd: {
                "Dogtag": {
                    "AccountId": bot.aid,
                    "ProfileId": bot._id,
                    "Nickname": bot.Info.Nickname,
                    "Side": bot.Info.Side,
                    "Level": bot.Info.Level,
                    "Time": (new Date().toISOString()),
                    "Status": "Killed by ",
                    "KillerAccountId": "Unknown",
                    "KillerProfileId": "Unknown",
                    "KillerName": "Unknown",
                    "WeaponName": "Unknown"
                }
            }
        };

        bot.Inventory.items.push(dogtagItem);
        return bot;
    }

    /** Temporary method to fetch an inventory from old bot files.
     *  To be removed when bot loadout generation is fully implemented */
    getInventoryTemp(botType)
    {
        const oldBotDbFile = Object.keys(db.bots_old).find(key => key.includes(`bot_${botType}`));
        const oldBotDb = json.parse(json.read(db.bots_old[oldBotDbFile]));
        return utility.getRandomValue(oldBotDb.inventory);
    }
}

class BotGenerator
{
    constructor()
    {
        this.inventory = {};
    }

    generateInventory(templateInventory, equipmentChances, generation)
    {
        // Generate base inventory with no items
        this.inventory = this.generateInventoryBase();

        // Go over all defined equipment slots and generate an item for each of them
        for (const equipmentSlot in templateInventory.equipment)
        {
            // Weapons have special generation and will be generated seperately; ArmorVest should be generated after TactivalVest
            if (["FirstPrimaryWeapon", "SecondPrimaryWeapon", "Holster", "ArmorVest"].includes(equipmentSlot))
            {
                continue;
            }
            this.generateEquipment(equipmentSlot, templateInventory.equipment[equipmentSlot], templateInventory.mods, equipmentChances);
        }

        // ArmorVest is generated afterwards to ensure that TacticalVest is always first, in case it is incompatible
        this.generateEquipment("ArmorVest", templateInventory.equipment.ArmorVest, templateInventory.mods, equipmentChances);

        // Roll weapon spawns and generate a weapon for each roll that passed
        const shouldSpawnPrimary = utility.getRandomIntEx(100) <= equipmentChances.equipment.FirstPrimaryWeapon;
        const shouldWeaponSpawn = {
            "FirstPrimaryWeapon": shouldSpawnPrimary,

            // Only roll for a chance at secondary if primary roll was successful
            "SecondPrimaryWeapon": shouldSpawnPrimary ? utility.getRandomIntEx(100) <= equipmentChances.equipment.SecondPrimaryWeapon : false,

            // Roll for an extra pistol, unless primary roll failed - in that case, pistol is guaranteed
            "Holster": shouldSpawnPrimary ? utility.getRandomIntEx(100) <= equipmentChances.equipment.Holster : true
        };

        for (const weaponType in shouldWeaponSpawn)
        {
            if (shouldWeaponSpawn[weaponType] && templateInventory.equipment[weaponType].length)
            {
                this.generateWeapon(weaponType, templateInventory.equipment[weaponType], templateInventory.mods, equipmentChances.mods, generation.items.magazines);
            }
        }

        this.generateLoot(templateInventory.items, generation.items);

        return helpfunc_f.helpFunctions.clone(this.inventory);
    }

    generateInventoryBase()
    {
        const equipmentId = utility.generateNewItemId();
        const equipmentTpl = "55d7217a4bdc2d86028b456d";

        const stashId = utility.generateNewItemId();
        const stashTpl = "566abbc34bdc2d92178b4576";

        const questRaidItemsId = utility.generateNewItemId();
        const questRaidItemsTpl = "5963866286f7747bf429b572";

        const questStashItemsId = utility.generateNewItemId();
        const questStashItemsTpl = "5963866b86f7747bfa1c4462";

        return {
            "items": [
                {
                    "_id": equipmentId,
                    "_tpl": equipmentTpl
                },
                {
                    "_id": stashId,
                    "_tpl": stashTpl
                },
                {
                    "_id": questRaidItemsId,
                    "_tpl": questRaidItemsTpl
                },
                {
                    "_id": questStashItemsId,
                    "_tpl": questStashItemsTpl
                }
            ],
            "equipment": equipmentId,
            "stash": stashId,
            "questRaidItems": questRaidItemsId,
            "questStashItems": questStashItemsId,
            "fastPanel": {}
        };
    }

    generateEquipment(equipmentSlot, equipmentPool, modPool, spawnChances)
    {
        const spawnChance = ["Pockets", "SecuredContainer"].includes(equipmentSlot) ? 100 : spawnChances.equipment[equipmentSlot];
        if (typeof spawnChance === "undefined")
        {
            logger.logWarning(`No spawn chance was defined for ${equipmentSlot}`);
            return;
        }

        const shouldSpawn = utility.getRandomIntEx(100) <= spawnChance;
        if (equipmentPool.length && shouldSpawn)
        {
            const id = utility.generateNewItemId();
            const tpl = utility.getRandomArrayValue(equipmentPool);
            const itemTemplate = database_f.database.tables.templates.items[tpl];

            if (!itemTemplate)
            {
                logger.logError(`Could not find item template with tpl ${tpl}`);
                logger.logInfo(`EquipmentSlot -> ${equipmentSlot}`);
                return;
            }

            if (this.isItemIncompatibleWithCurrentItems(this.inventory.items, tpl, equipmentSlot))
            {
                // Bad luck - randomly picked item was not compatible with current gear
                return;
            }

            const item = {
                "_id": id,
                "_tpl": tpl,
                "parentId": this.inventory.equipment,
                "slotId": equipmentSlot,
                ...this.generateExtraPropertiesForItem(itemTemplate)
            };

            if (Object.keys(modPool).includes(tpl))
            {
                const items = this.generateModsForItem([item], modPool, id, itemTemplate, spawnChances.mods);
                this.inventory.items.push(...items);
            }
            else
            {
                this.inventory.items.push(item);
            }
        }
    }

    generateWeapon(equipmentSlot, weaponPool, modPool, modChances, magCounts)
    {
        const id = utility.generateNewItemId();
        const tpl = utility.getRandomArrayValue(weaponPool);
        const itemTemplate = database_f.database.tables.templates.items[tpl];

        if (!itemTemplate)
        {
            logger.logError(`Could not find item template with tpl ${tpl}`);
            logger.logError(`WeaponSlot -> ${equipmentSlot}`);
            return;
        }

        let weaponMods = [{
            "_id": id,
            "_tpl": tpl,
            "parentId": this.inventory.equipment,
            "slotId": equipmentSlot,
            ...this.generateExtraPropertiesForItem(itemTemplate)
        }];

        if (Object.keys(modPool).includes(tpl))
        {
            weaponMods = this.generateModsForItem(weaponMods, modPool, id, itemTemplate, modChances);
        }

        if (!this.isWeaponValid(weaponMods))
        {
            // Invalid weapon generated, fallback to preset
            logger.logWarning(`Weapon ${tpl} was generated incorrectly, see error above`);
            weaponMods = [];

            // TODO: Right now, preset weapons trigger a lot of warnings regarding missing ammo in magazines & such
            let preset;
            for (const [presetId, presetObj] of Object.entries(database_f.database.tables.globals.ItemPresets))
            {
                if (presetObj._items[0]._tpl === tpl)
                {
                    preset = presetObj;
                    break;
                }
            }

            if (preset)
            {
                const parentItem = preset._items[0];
                preset._items[0] = {...parentItem, ...{
                    "parentId": this.inventory.equipment,
                    "slotId": equipmentSlot,
                    ...this.generateExtraPropertiesForItem(itemTemplate)
                }};
                weaponMods.push(...preset._items);
            }
            else
            {
                logger.logError(`Could not find preset for weapon with tpl ${tpl}`);
                return;
            }
        }

        // Find ammo to use when filling magazines
        const ammoTpl = this.getCompatibleAmmo(weaponMods, itemTemplate);

        // Fill existing magazines to full and sync ammo type
        for (const mod of weaponMods.filter(mod => mod.slotId === "mod_magazine"))
        {
            this.fillExistingMagazines(weaponMods, mod, ammoTpl);
        }

        this.inventory.items.push(...weaponMods);

        // Generate extra magazines and attempt add them to TacticalVest or Pockets
        const magCount = utility.getRandomInt(magCounts.min, magCounts.max);
        this.generateExtraMagazines(weaponMods, itemTemplate, magCount, ammoTpl);
    }

    generateModsForItem(items, modPool, parentId, parentTemplate, modSpawnChances)
    {
        const itemModPool = modPool[parentTemplate._id];

        if (!parentTemplate._props.Slots.length
            && !parentTemplate._props.Cartridges.length
            && !parentTemplate._props.Chambers.length)
        {
            logger.logError(`Item ${parentTemplate._id} had mods defined, but no slots to support them`);
            return items;
        }

        for (const modSlot in itemModPool)
        {
            let itemSlot;
            switch (modSlot)
            {
                case "patron_in_weapon":
                    itemSlot = parentTemplate._props.Chambers.find(c => c._name === modSlot);
                    break;
                case "cartridges":
                    itemSlot = parentTemplate._props.Cartridges.find(c => c._name === modSlot);
                    break;
                default:
                    itemSlot = parentTemplate._props.Slots.find(s => s._name === modSlot);
                    break;
            }

            if (!itemSlot)
            {
                logger.logError(`Slot '${modSlot}' does not exist for item ${parentTemplate._id}`);
                continue;
            }

            const modSpawnChance = itemSlot._required || ["mod_magazine", "patron_in_weapon", "cartridges"].includes(modSlot)
                ? 100
                : modSpawnChances[modSlot];
            if (utility.getRandomIntEx(100) > modSpawnChance)
            {
                continue;
            }

            const exhaustableModPool = new ExhaustableArray(itemModPool[modSlot]);

            let modTpl;
            let found = false;
            while (exhaustableModPool.hasValues())
            {
                modTpl = exhaustableModPool.getRandomValue();
                if (!this.isItemIncompatibleWithCurrentItems(items, modTpl, modSlot))
                {
                    found = true;
                    break;
                }
            }

            if (!found || !modTpl)
            {
                if (itemSlot._required)
                {
                    logger.logError(`Could not locate any compatible items to fill '${modSlot}' for ${parentTemplate._id}`);
                }
                continue;
            }

            if (!itemSlot._props.filters[0].Filter.includes(modTpl))
            {
                logger.logError(`Mod ${modTpl} is not compatible with slot '${modSlot}' for item ${parentTemplate._id}`);
                continue;
            }

            const modTemplate = database_f.database.tables.templates.items[modTpl];
            if (!modTemplate)
            {
                logger.logError(`Could not find mod item template with tpl ${modTpl}`);
                logger.logInfo(`Item -> ${parentTemplate._id}; Slot -> ${modSlot}`);
                continue;
            }

            const modId = utility.generateNewItemId();
            items.push({
                "_id": modId,
                "_tpl": modTpl,
                "parentId": parentId,
                "slotId": modSlot,
                ...this.generateExtraPropertiesForItem(modTemplate)
            });

            if (Object.keys(modPool).includes(modTpl))
            {
                this.generateModsForItem(items, modPool, modId, modTemplate, modSpawnChances);
            }
        }

        return items;
    }

    generateExtraPropertiesForItem(itemTemplate)
    {
        let properties = {};

        if (itemTemplate._props.MaxDurability)
        {
            properties.Repairable = {"Durability": itemTemplate._props.MaxDurability};
        }

        if (itemTemplate._props.HasHinge)
        {
            properties.Togglable = {"On": true};
        }

        if (itemTemplate._props.Foldable)
        {
            properties.Foldable = {"Folded": false};
        }

        if (itemTemplate._props.weapFireType && itemTemplate._props.weapFireType.length)
        {
            properties.FireMode = {"FireMode": itemTemplate._props.weapFireType[0]};
        }

        if (itemTemplate._props.MaxHpResource)
        {
            properties.MedKit = {"HpResource": itemTemplate._props.MaxHpResource};
        }

        if (itemTemplate._props.MaxResource && itemTemplate._props.foodUseTime)
        {
            properties.FoodDrink = {"HpPercent": itemTemplate._props.MaxResource};
        }

        return Object.keys(properties).length ? {"upd": properties} : {};
    }

    isItemIncompatibleWithCurrentItems(items, tplToCheck, equipmentSlot)
    {
        // TODO: Can probably be optimized to cache itemTemplates as items are added to inventory
        const itemTemplates = items.map(i => database_f.database.tables.templates.items[i._tpl]);
        const templateToCheck = database_f.database.tables.templates.items[tplToCheck];

        return (itemTemplates.some(item => item._props[`Blocks${equipmentSlot}`] || item._props.ConflictingItems.includes(tplToCheck)))
            || (items.some(item => templateToCheck._props[`Blocks${item.slotId}`] || templateToCheck._props.ConflictingItems.includes(item._tpl)));
    }

    /** Checks if all required slots are occupied on a weapon and all it's mods */
    isWeaponValid(itemList)
    {
        for (const item of itemList)
        {
            const template = database_f.database.tables.templates.items[item._tpl];
            if (!template._props.Slots || !template._props.Slots.length)
            {
                continue;
            }

            for (const slot of template._props.Slots)
            {
                if (!slot._required)
                {
                    continue;
                }

                const slotItem = itemList.find(i => i.parentId === item._id && i.slotId === slot._name);
                if (!slotItem)
                {
                    logger.logError(`Required slot '${slot._name}' on ${template._id} was empty`);
                    return false;
                }
            }
        }

        return true;
    }

    /** Generates extra magazines or bullets (if magazine is internal) and adds them to TacticalVest and Pockets.
     * Additionally, adds extra bullets to SecuredContainer */
    generateExtraMagazines(weaponMods, weaponTemplate, count, ammoTpl)
    {
        let magazineTpl = "";
        let magazine = weaponMods.find(m => m.slotId === "mod_magazine");
        if (!magazine)
        {
            logger.logWarning(`Generated weapon with tpl ${weaponTemplate._id} had no magazine`);
            magazineTpl = weaponTemplate._props.defMagType;
        }
        else
        {
            magazineTpl = magazine._tpl;
        }

        const magTemplate = database_f.database.tables.templates.items[magazineTpl];
        if (!magTemplate)
        {
            logger.logError(`Could not find magazine template with tpl ${magazineTpl}`);
            return;
        }

        if (magTemplate._props.ReloadMagType === "InternalMagazine")
        {
            /* Get the amount of bullets that would fit in the internal magazine
             * and multiply by how many magazines were supposed to be created */
            const bulletCount = magTemplate._props.Cartridges[0]._max_count * count;

            const ammoItems = helpfunc_f.helpFunctions.splitStack({
                "_id": utility.generateNewItemId(),
                "_tpl": ammoTpl,
                "upd": {"StackObjectsCount": bulletCount}
            });

            for (const ammoItem of ammoItems)
            {
                this.addItemWithChildrenToEquipmentSlot(["TacticalVest", "Pockets"], ammoItem._id, ammoItem._tpl, [ammoItem]);
            }
        }
        else
        {
            for (let i = 0; i < count; i++)
            {
                const magId = utility.generateNewItemId();
                const magWithAmmo = [
                    {
                        "_id": magId,
                        "_tpl": magazineTpl
                    },
                    {
                        "_id": utility.generateNewItemId(),
                        "_tpl": ammoTpl,
                        "parentId": magId,
                        "slotId": "cartridges",
                        "upd": {"StackObjectsCount": magTemplate._props.Cartridges[0]._max_count}
                    }
                ];

                this.addItemWithChildrenToEquipmentSlot(["TacticalVest", "Pockets"], magId, magazineTpl, magWithAmmo);
            }
        }

        const ammoTemplate = database_f.database.tables.templates.items[ammoTpl];
        if (!ammoTemplate)
        {
            logger.logError(`Could not find ammo template with tpl ${ammoTpl}`);
            return;
        }

        // Add 4 stacks of bullets to SecuredContainer
        for (let i = 0; i < 4; i++)
        {
            const id = utility.generateNewItemId();
            this.addItemWithChildrenToEquipmentSlot(["SecuredContainer"], id, ammoTpl, [{
                "_id": id,
                "_tpl": ammoTpl,
                "upd": {"StackObjectsCount": ammoTemplate._props.StackMaxSize}
            }]);
        }
    }

    /** Finds and returns tpl of ammo that should be used, while making sure it's compatible */
    getCompatibleAmmo(weaponMods, weaponTemplate)
    {
        let ammoTpl = "";
        let ammoToUse = weaponMods.find(mod => mod.slotId === "patron_in_weapon");
        if (!ammoToUse)
        {
            // No bullet found in chamber, search for ammo in magazines instead
            ammoToUse = weaponMods.find(mod => mod.slotId === "cartridges");
            if (!ammoToUse)
            {
                // Still could not locate ammo to use? Fallback to weapon default
                logger.logWarning(`Could not locate ammo to use for ${weaponTemplate._id}, falling back to default -> ${weaponTemplate._props.defAmmo}`);
                // Immediatelly returns, as default ammo is guaranteed to be compatible
                return weaponTemplate._props.defAmmo;
            }
            else
            {
                ammoTpl = ammoToUse._tpl;
            }
        }
        else
        {
            ammoTpl = ammoToUse._tpl;
        }

        if (weaponTemplate._props.Chambers[0] && !weaponTemplate._props.Chambers[0]._props.filters[0].Filter.includes(ammoToUse._tpl))
        {
            // Incompatible ammo was found, return default (can happen with .366 and 7.62x39 weapons)
            return weaponTemplate._props.defAmmo;
        }

        return ammoTpl;
    }

    /** Fill existing magazines to full, while replacing their contents with specified ammo */
    fillExistingMagazines(weaponMods, magazine, ammoTpl)
    {
        const modTemplate = database_f.database.tables.templates.items[magazine._tpl];
        if (!modTemplate)
        {
            logger.logError(`Could not find magazine template with tpl ${magazine._tpl}`);
            return;
        }

        const stackSize = modTemplate._props.Cartridges[0]._max_count;
        const cartridges = weaponMods.find(m => m.parentId === magazine._id && m.slotId === "cartridges");

        if (!cartridges)
        {
            logger.logWarning(`Magazine with tpl ${magazine._tpl} had no ammo`);
            weaponMods.push({
                "_id": utility.generateNewItemId(),
                "_tpl": ammoTpl,
                "parentId": magazine._id,
                "slotId": "cartridges",
                "upd": {"StackObjectsCount": stackSize}
            });
        }
        else
        {
            cartridges._tpl = ammoTpl;
            cartridges.upd = {"StackObjectsCount": stackSize};
        }
    }

    generateLoot(lootPool, itemCounts)
    {
        // TODO: Implement a mechanism for item rarity (maybe by value or something)

        // Flatten all individual slot loot pools into one big pool, while filtering out potentially missing templates
        let lootTemplates = [];
        for (const [slot, pool] of Object.entries(lootPool))
        {
            if (!pool || !pool.length)
            {
                continue;
            }
            const poolItems = pool.map(lootTpl => database_f.database.tables.templates.items[lootTpl]);
            lootTemplates.push(...poolItems.filter(x => !!x));
        }

        // Get all healing items
        const healingItems = lootTemplates.filter(template => "medUseTime" in template._props);

        // Get all grenades
        const grenadeItems = lootTemplates.filter(template => "ThrowType" in template._props);

        // Get all misc loot items (excluding magazines, bullets, grenades and healing items)
        const lootItems = lootTemplates.filter(template =>
            !("ammoType" in template._props)
            && !("ReloadMagType" in template._props)
            && !("medUseTime" in template._props)
            && !("ThrowType" in template._props));

        this.addLootFromPool(healingItems, ["TacticalVest", "Pockets"], itemCounts.healing.min, itemCounts.healing.max);
        this.addLootFromPool(lootItems, ["Backpack", "Pockets", "TacticalVest"], itemCounts.looseLoot.min, itemCounts.looseLoot.max);
        this.addLootFromPool(grenadeItems, ["TacticalVest", "Pockets"], itemCounts.grenades.min, itemCounts.grenades.max);
    }

    addLootFromPool(pool, equipmentSlots, min, max)
    {
        if (pool.length)
        {
            for (let count = 0; count < utility.getRandomInt(min, max); count++)
            {
                const itemTemplate = utility.getRandomArrayValue(pool);
                const id = utility.generateNewItemId();

                this.addItemWithChildrenToEquipmentSlot(equipmentSlots, id, itemTemplate._id, [{
                    "_id": id,
                    "_tpl": itemTemplate._id,
                    ...this.generateExtraPropertiesForItem(itemTemplate)
                }]);
            }
        }
    }

    /** Adds an item with all its childern into specified equipmentSlots, wherever it fits.
     * Returns a `boolean` indicating success. */
    addItemWithChildrenToEquipmentSlot(equipmentSlots, parentId, parentTpl, itemWithChildren)
    {
        for (const slot of equipmentSlots)
        {
            const container = this.inventory.items.find(i => i.slotId === slot);
            if (!container)
            {
                continue;
            }

            const containerTemplate = database_f.database.tables.templates.items[container._tpl];
            if (!containerTemplate)
            {
                logger.logError(`Could not find container template with tpl ${container._tpl}`);
                continue;
            }

            if (!containerTemplate._props.Grids || !containerTemplate._props.Grids.length)
            {
                // Container has no slots to hold items
                continue;
            }

            const itemSize = helpfunc_f.helpFunctions.getItemSize(parentTpl, parentId, itemWithChildren);

            for (const slot of containerTemplate._props.Grids)
            {
                const containerItems = this.inventory.items.filter(i => i.parentId === container._id && i.slotId === slot._name);
                const slotMap = helpfunc_f.helpFunctions.getContainerMap(slot._props.cellsH, slot._props.cellsV, containerItems, container._id);
                const findSlotResult = helpfunc_f.helpFunctions.findSlotForItem(slotMap, itemSize[0], itemSize[1]);

                if (findSlotResult.success)
                {
                    const parentItem = itemWithChildren.find(i => i._id === parentId);
                    parentItem.parentId = container._id;
                    parentItem.slotId = slot._name;
                    parentItem.location = {
                        "x": findSlotResult.x,
                        "y": findSlotResult.y,
                        "r": findSlotResult.rotation ? 1 : 0
                    };
                    this.inventory.items.push(...itemWithChildren);
                    return true;
                }
            }
        }

        return false;
    }
}

class ExhaustableArray
{
    constructor(itemPool)
    {
        this.pool = helpfunc_f.helpFunctions.clone(itemPool);
    }

    getRandomValue()
    {
        if (!this.pool || !this.pool.length)
        {
            return null;
        }

        const index = utility.getRandomInt(0, this.pool.length - 1);
        const toReturn = helpfunc_f.helpFunctions.clone(this.pool[index]);
        this.pool.splice(index, 1);
        return toReturn;
    }

    hasValues()
    {
        if (this.pool && this.pool.length)
        {
            return true;
        }

        return false;
    }
}

class BotCallbacks
{
    constructor()
    {
        router.addDynamicRoute("/singleplayer/settings/bot/limit/", this.getBotLimit.bind());
        router.addDynamicRoute("/singleplayer/settings/bot/difficulty/", this.getBotDifficulty.bind());
        router.addStaticRoute("/client/game/bot/generate", this.generateBots.bind());
    }

    getBotLimit(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 1];
        return response_f.responseController.noBody(modules_f.modulesController.getBotLimit(type));
    }

    getBotDifficulty(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 2].toLowerCase();
        let difficulty = splittedUrl[splittedUrl.length - 1];
        return response_f.responseController.noBody(modules_f.modulesController.getBotDifficulty(type, difficulty));
    }

    generateBots(url, info, sessionID)
    {
        return response_f.responseController.getBody(bots_f.botController.generate(info, sessionID));
    }
}

class BotConfig
{
    constructor()
    {
        this.pmcSpawn = {
            "enabled": true,
            "spawnChance": 35,
            "usecChance": 50
        };
        this.limits = {
            "assault": 30,
            "marksman": 30,
            "pmcBot": 30,
            "bossBully": 30,
            "bossGluhar": 30,
            "bossKilla": 30,
            "bossKojaniy": 30,
            "bossSanitar": 30,
            "followerBully": 30,
            "followerGluharAssault": 30,
            "followerGluharScout": 30,
            "followerGluharSecurity": 30,
            "followerGluharSnipe": 30,
            "followerKojaniy": 30,
            "followerSanitar": 30,
            "test": 30,
            "followerTest": 30,
            "bossTest": 30
        };
    }
}

module.exports.botController = new BotController();
module.exports.botCallbacks = new BotCallbacks();
module.exports.botConfig = new BotConfig();
module.exports.botGenerator = new BotGenerator();
