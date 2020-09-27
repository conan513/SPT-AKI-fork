"use strict";

class BotController
{
    constructor()
    {
        this.limitSettings = {};
        this.pmcSettings = {};
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
        bot.Inventory = this.generateInventory(node.inventory);

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

    generateInventory(templateInventory)
    {
        let inventory = this.generateInventoryBase();
        for (const equipmentSlot in templateInventory.equipment)
        {
            // Weapons have special generation and will be generated seperately; ArmorVest should be generated after TactivalVest
            if (["FirstPrimaryWeapon", "SecondPrimaryWeapon", "Holster", "ArmorVest"].includes(equipmentSlot))
            {
                continue;
            }
            this.generateEquipment(inventory, equipmentSlot, templateInventory.equipment[equipmentSlot], templateInventory.mods);
        }

        // ArmorVest is generated afterwards to ensure that TacticalVest is always first, in case it is incompatible
        this.generateEquipment(inventory, "ArmorVest", templateInventory.equipment["ArmorVest"], templateInventory.mods);

        this.generateWeapons(
            inventory,
            templateInventory.equipment["FirstPrimaryWeapon"],
            templateInventory.equipment["SecondPrimaryWeapon"],
            templateInventory.equipment["Holster"],
            templateInventory.mods);

        // TODO: Generate meds/loot/etc.

        return inventory;
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

    generateEquipment(inventory, equipmentSlot, equipmentPool, modPool)
    {
        const shouldSpawn = !(["Pockets", "SecuredContainer"].includes(equipmentSlot))
            ? utility.getRandomIntEx(100) <= bots_f.botConfig.slotSpawnChance[equipmentSlot]
            : true;

        if (equipmentPool.length && shouldSpawn)
        {
            const id = utility.generateNewItemId();
            const tpl = utility.getRandomArrayValue(equipmentPool);
            const itemTemplate = database_f.database.tables.templates.items[tpl];

            if (!itemTemplate)
            {
                logger.logError(`Could not find item template with tpl ${tpl}`);
                logger.logInfo(`EquipmentSlot -> ${equipmentSlot}`);
                return inventory;
            }

            if (this.isItemIncompatibleWithCurrentInventory(inventory, tpl, equipmentSlot))
            {
                // Bad luck - randomly picked item was not compatible with current gear
                return inventory;
            }

            inventory.items.push({
                "_id": id,
                "_tpl": tpl,
                "parentId": inventory.equipment,
                "slotId": equipmentSlot,
                ...this.generateExtraPropertiesForItem(itemTemplate)
            });

            if (Object.keys(modPool).includes(tpl))
            {
                this.generateModsForItem(inventory, modPool, id, itemTemplate);
            }
        }

        return inventory;
    }

    generateWeapons(inventory, primaryWeaponPool, secondaryWeaponPool, holsterPool, modPool)
    {
        const shouldSpawnPrimary = utility.getRandomIntEx(100) <= bots_f.botConfig.slotSpawnChance["FirstPrimaryWeapon"];
        // If roll for primary failed, at least generate a pistol. Otherwise, roll for an extra
        const shouldSpawnHolster = shouldSpawnPrimary ? utility.getRandomIntEx(100) <= bots_f.botConfig.slotSpawnChance["Holster"] : true;
        // If roll for primary failed, don't roll for chance at secondary
        const shouldSpawnSecondary = shouldSpawnPrimary ? utility.getRandomIntEx(100) <= bots_f.botConfig.slotSpawnChance["SecondPrimaryWeapon"] : false;

        if (shouldSpawnPrimary && primaryWeaponPool.length)
        {
            this.generateWeapon(inventory, "FirstPrimaryWeapon", primaryWeaponPool, modPool);
        }

        if (shouldSpawnHolster && holsterPool.length)
        {
            this.generateWeapon(inventory, "Holster", holsterPool, modPool);
        }

        if (shouldSpawnSecondary && secondaryWeaponPool.length)
        {
            this.generateWeapon(inventory, "SecondPrimaryWeapon", secondaryWeaponPool, modPool);
        }

        return inventory;
    }

    generateWeapon(inventory, equipmentSlot, weaponPool, modPool)
    {
        const id = utility.generateNewItemId();
        const tpl = utility.getRandomArrayValue(weaponPool);
        const itemTemplate = database_f.database.tables.templates.items[tpl];

        if (!itemTemplate)
        {
            logger.logError(`Could not find item template with tpl ${tpl}`);
            logger.logError(`WeaponSlot -> ${equipmentSlot}`);
            return inventory;
        }

        let weaponMods = {
            "items": [{
                "_id": id,
                "_tpl": tpl,
                "parentId": inventory.equipment,
                "slotId": equipmentSlot,
                ...this.generateExtraPropertiesForItem(itemTemplate)
            }]
        };

        if (Object.keys(modPool).includes(tpl))
        {
            this.generateModsForItem(weaponMods, modPool, id, itemTemplate);
        }

        if (!this.isWeaponValid(weaponMods.items))
        {
            // Invalid weapon generated, fallback to preset
            logger.logWarning(`Weapon ${tpl} was generated incorrectly, see error above`);
            weaponMods = {
                "items": [{
                    "_id": id,
                    "_tpl": tpl,
                    "parentId": inventory.equipment,
                    "slotId": equipmentSlot,
                    ...this.generateExtraPropertiesForItem(itemTemplate)
                }]
            };
            this.getPresetForWeapon(weaponMods, tpl);
        }

        // Find ammo to use when generating extra magazines
        let ammoTpl = "";
        let ammoToUse = weaponMods.items.find(mod => mod.slotId === "patron_in_weapon");
        if (!ammoToUse)
        {
            // No bullet found in chamber, search for ammo in magazines instead
            ammoToUse = weaponMods.items.find(mod => mod.slotId === "cartridges");
            if (!ammoToUse)
            {
                // Still could not locate ammo to use? Fallback to weapon default
                ammoTpl = itemTemplate._props.defAmmo;
                logger.logWarning(`Could not locate ammo to use for ${tpl}, falling back to default -> ${ammoTpl}`);
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

        // Fill existing magazines to full
        weaponMods.items.forEach(mod =>
        {
            if (mod.slotId === "mod_magazine")
            {
                const modTemplate = database_f.database.tables.templates.items[mod._tpl];
                if (!modTemplate)
                {
                    logger.logError(`Could not find magazine template with tpl ${mod._tpl}`);
                    return;
                }

                const stackSize = modTemplate._props.Cartridges[0]._max_count;
                const cartridges = weaponMods.items.find(m => m.parentId === mod._id);

                if (!cartridges)
                {
                    logger.logWarning(`Magazine with tpl ${mod._tpl} had no ammo`);
                    weaponMods.items.push({
                        "_id": utility.generateNewItemId(),
                        "_tpl": ammoTpl,
                        "parentId": mod._id,
                        "slotId": "cartridges",
                        "upd": {"StackObjectsCount": stackSize}
                    });
                }
                else
                {
                    cartridges.upd = {"StackObjectsCount": stackSize};
                }
            }
        });

        inventory.items.push(...weaponMods.items);

        // TODO: Generate extra magazines and add them to vest or pockets

        return inventory;
    }

    generateModsForItem(inventory, modPool, parentId, parentTemplate)
    {
        const itemModPool = modPool[parentTemplate._id];

        if (!parentTemplate._props.Slots.length
            && !parentTemplate._props.Cartridges.length
            && !parentTemplate._props.Chambers.length)
        {
            logger.logError(`Item ${parentTemplate._id} had mods defined, but no slots to support them`);
            return inventory;
        }

        for (const modSlot in itemModPool)
        {
            let itemSlot;
            if (modSlot === "patron_in_weapon")
            {
                itemSlot = parentTemplate._props.Chambers.find(c => c._name === modSlot);
            }
            else if (modSlot === "cartridges")
            {
                itemSlot = parentTemplate._props.Cartridges.find(c => c._name === modSlot);
            }
            else
            {
                itemSlot = parentTemplate._props.Slots.find(s => s._name === modSlot);
            }

            if (!itemSlot)
            {
                logger.logError(`Slot '${modSlot}' does not exist for item ${parentTemplate._id}`);
                continue;
            }

            const modTpl = utility.getRandomValue(itemModPool[modSlot]);

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
            inventory.items.push({
                "_id": modId,
                "_tpl": modTpl,
                "parentId": parentId,
                "slotId": modSlot,
                ...this.generateExtraPropertiesForItem(modTemplate)
            });

            if (Object.keys(modPool).includes(modTpl))
            {
                this.generateModsForItem(inventory, modPool, modId, modTemplate);
            }
        }

        return inventory;
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

        return Object.keys(properties).length ? {"upd": properties} : {};
    }

    isItemIncompatibleWithCurrentInventory(inventory, tplToCheck, equipmentSlot)
    {
        // TODO: Can probably be optimized to cache itemTemplates as items are added to inventory
        const itemTemplates = inventory.items.map(i => database_f.database.tables.templates.items[i._tpl]);
        return itemTemplates.some(item => item._props[`Blocks${equipmentSlot}`] || item._props.ConflictingItems.includes(tplToCheck));
    }

    getPresetForWeapon(inventory, weaponTpl)
    {
        let preset = {};
        // TODO: This is kind of inefficient, but I'm not sure how it could be improved - Terkoiz
        for (const [presetId, presetObj] of Object.entries(database_f.database.tables.globals.ItemPresets))
        {
            if (presetObj._items[0]._tpl === weaponTpl)
            {
                preset = presetObj;
                break;
            }
        }

        if (preset)
        {
            // Don't add the base weapon item again, as it was included previously
            inventory.items.push(...preset._items.filter(i => i._tpl !== weaponTpl));
        }
        else
        {
            logger.logError(`Could not find preset for weapon with tpl ${weaponTpl}`);
        }

        return inventory;
    }

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
}

class BotCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/bot/generate", this.generateBots.bind());
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

        this.slotSpawnChance = {
            // Testing placeholder - we want to generate as much as possible to catch potential issues
            "Headwear": 100,
            "Earpiece": 100,
            "FaceCover": 100,
            "ArmorVest": 100,
            "Eyewear": 100,
            "ArmBand": 100,
            "TacticalVest": 100,
            "Backpack": 100,
            "FirstPrimaryWeapon": 100, // Chance of primary - if roll fails, holster is spawned instead
            "SecondPrimaryWeapon": 100, // Chance of extra primary (used only if first primary was generated)
            "Holster": 100, // Chance of extra sidearm (used only if primary was generated)
            "Scabbard": 100
        };
    }
}

module.exports.botController = new BotController();
module.exports.botCallbacks = new BotCallbacks();
module.exports.botConfig = new BotConfig();
