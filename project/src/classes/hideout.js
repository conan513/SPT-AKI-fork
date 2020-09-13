"use strict";

const areaTypes = {
    VENTS: 0,
    SECURITY: 1,
    LAVATORY: 2,
    STASH: 3,
    GENERATOR: 4,
    HEATING: 5,
    WATER_COLLECTOR: 6,
    MEDSTATION: 7,
    NUTRITION_UNIT: 8,
    REST_SPACE: 9,
    WORKBENCH: 10,
    INTEL_CENTER: 11,
    SHOOTING_RANGE: 12,
    LIBRARY: 13,
    SCAV_CASE: 14,
    ILLUMINATION: 15,
    PLACE_OF_FAME: 16,
    AIR_FILTERING: 17,
    SOLAR_POWER: 18,
    BOOZE_GENERATOR: 19,
    BITCOIN_FARM: 20,
    CHRISTMAS_TREE: 21,
    SCAV_CASE_ITEMS: 141
};

class HideoutController
{
    upgrade(pmcData, body, sessionID)
    {
        const items = body.items.map(reqItem =>
        {
            const item = pmcData.Inventory.items.find(invItem => invItem._id === reqItem.id);
            return {
                inventoryItem: item,
                requestedItem: reqItem
            };
        });

        // If it's not money, its construction / barter items
        for (let item of items)
        {
            if (!item.inventoryItem)
            {
                logger.logError(`Failed to find item in inventory with id ${item.requestedItem.id}`);
                return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
            }

            if (itm_hf.isMoneyTpl(item.inventoryItem._tpl) && item.inventoryItem.upd?.StackObjectsCount > item.requestedItem.count)
            {
                item.inventoryItem.upd.StackObjectsCount -= item.requestedItem.count;
            }
            else
            {
                move_f.removeItem(pmcData, item.inventoryItem._id, item_f.itemServer.getOutput(), sessionID);
            }
        }

        // Construction time management
        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            logger.logError(`Could not find area of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
        }

        const hideoutData = database_f.database.tables.hideout.areas.find(area => area.type === body.areaType);
        if (!hideoutData)
        {
            logger.logError(`Could not find area in database of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
        }

        let ctime = hideoutData.stages[hideoutArea.level + 1].constructionTime;
        if (ctime > 0)
        {
            let timestamp = Math.floor(Date.now() / 1000);

            hideoutArea.completeTime = timestamp + ctime;
            hideoutArea.constructing = true;
        }

        return item_f.itemServer.getOutput();
    }

    upgradeComplete(pmcData, body, sessionID)
    {
        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            logger.logError(`Could not find area of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
        }

        // Upgrade area
        hideoutArea.level++;
        hideoutArea.completeTime = 0;
        hideoutArea.constructing = false;

        const hideoutData = database_f.database.tables.hideout.areas.find(area => area.type === hideoutArea.type);
        if (!hideoutData)
        {
            logger.logError(`Could not find area in database of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
        }

        // Apply bonuses
        let bonuses = hideoutData.stages[hideoutArea.level].bonuses;
        if (bonuses.length > 0)
        {
            for (let bonus of bonuses)
            {
                this.applyPlayerUpgradesBonuses(pmcData, bonus);
            }
        }

        return item_f.itemServer.getOutput();
    }

    // Move items from hideout
    putItemsInAreaSlots(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        const items = Object.entries(body.items).map(kvp =>
        {
            const item = pmcData.Inventory.items.find(invItem => invItem._id === kvp[1].id);
            return {
                inventoryItem: item,
                requestedItem: kvp[1],
                slot: kvp[0]
            };
        });

        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            logger.logError(`Could not find area of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(output);
        }

        for (let item of items)
        {
            if (!item.inventoryItem)
            {
                logger.logError(`Failed to find item in inventory with id ${item.requestedItem.id}`);
                return itm_hf.appendErrorToOutput(output);
            }

            const slot_position = item.slot;
            const slot_to_add = {
                "item": [{
                    "_id": item.inventoryItem._id,
                    "_tpl": item.inventoryItem._tpl,
                    "upd": item.inventoryItem.upd
                }]
            };

            if (!(slot_position in hideoutArea.slots))
            {
                hideoutArea.slots.push(slot_to_add);
            }
            else
            {
                hideoutArea.slots.splice(slot_position, 1, slot_to_add);
            }

            output = move_f.removeItem(pmcData, item.inventoryItem._id, output, sessionID);
        }

        return output;
    }

    takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            logger.logError(`Could not find area of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(output);
        }

        if (hideoutArea.type === areaTypes.GENERATOR)
        {
            let itemToMove = hideoutArea.slots[body.slots[0]].item[0];
            let newReq = {
                "items": [{
                    "item_id": itemToMove._tpl,
                    "count": 1,
                }],
                "tid": "ragfair"
            };

            output = move_f.addItem(pmcData, newReq, output, sessionID, null);

            // If addItem returned with errors, don't continue any further
            if (output.badRequest?.length > 0)
            {
                return output;
            }

            pmcData = profile_f.profileServer.getPmcProfile(sessionID);
            output.items.new[0].upd = itemToMove.upd;

            const item = pmcData.Inventory.items.find(i => i._id == output.items.new[0]._id);
            if (item)
            {
                item.upd = itemToMove.upd;
            }
            else
            {
                logger.logError(`Could not find item in inventory with id ${output.items.new[0]._id}`);
            }

            hideoutArea.slots[body.slots[0]] = {
                "item": null
            };
        }
        else
        {
            if (!hideoutArea.slots[0]?.item[0]?._tpl)
            {
                logger.logError(`Could not find item to take out of slot 0 for areaType ${hideoutArea.type}`);
                return itm_hf.appendErrorToOutput(output);
            }

            let newReq = {
                "items": [{
                    "item_id": hideoutArea.slots[0].item[0]._tpl,
                    "count": 1,
                }],
                "tid": "ragfair"
            };

            output = move_f.addItem(pmcData, newReq, output, sessionID, null);

            // If addItem returned with errors, don't continue any further
            if (output.badRequest?.length > 0)
            {
                return output;
            }

            hideoutArea.slots.splice(0, 1);
        }

        return output;
    }

    toggleArea(pmcData, body, sessionID)
    {
        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            logger.logError(`Could not find area of type ${body.areaType}`);
            return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
        }

        hideoutArea.active = body.enabled;

        return item_f.itemServer.getOutput();
    }

    singleProductionStart(pmcData, body, sessionID)
    {
        this.registerProduction(pmcData, body, sessionID);

        let output = item_f.itemServer.getOutput();

        for (let itemToDelete of body.items)
        {
            output = move_f.removeItem(pmcData, itemToDelete.id, output, sessionID);
        }

        return output;
    }

    scavCaseProductionStart(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        for (let requestedItem of body.items)
        {
            const inventoryItem = pmcData.Inventory.items.find(item => item._id === requestedItem.id);

            if (inventoryItem?.upd?.StackObjectsCount > requestedItem.count)
            {
                inventoryItem.upd.StackObjectsCount -= requestedItem.count;
            }
            else
            {
                output = move_f.removeItem(pmcData, requestedItem.id, output, sessionID);
            }
        }

        const recipe = database_f.database.tables.hideout.scavcase.find(r => r._id === body.recipeId);
        if (!recipe)
        {
            logger.logError(`Failed to find Scav Case recipe with id ${body.recipeId}`);
            return itm_hf.appendErrorToOutput(output);
        }

        let rarityItemCounter = {};
        let products = [];

        for (let rarity in recipe.EndProducts)
        {
            // TODO: This ensures ScavCase always has the max amount of items possible. Should probably randomize this
            if (recipe.EndProducts[rarity].max > 0)
            {
                rarityItemCounter[rarity] = recipe.EndProducts[rarity].max;
            }
        }

        // TODO: This probably needs to be rewritten eventually, as poking at random items
        // and hoping to find one of the correct rarity is wildly inefficient and inconsistent
        for (let rarityType in rarityItemCounter)
        {
            while (rarityItemCounter[rarityType] > 0)
            {
                let random = utility.getRandomIntEx(Object.keys(database_f.database.tables.templates.items).length);
                let randomKey = Object.keys(database_f.database.tables.templates.items)[random];
                let tempItem = database_f.database.tables.templates.items[randomKey];

                if (tempItem._props?.Rarity === rarityType)
                {
                    products.push({
                        "_id": utility.generateNewItemId(),
                        "_tpl": tempItem._id
                    });

                    rarityItemCounter[rarityType] -= 1;
                }
            }
        }

        pmcData.Hideout.Production[areaTypes.SCAV_CASE_ITEMS] = {
            "Products": products
        };

        pmcData.Hideout.Production[areaTypes.SCAV_CASE] = {
            "Progress": 0,
            "inProgress": true,
            "RecipeId": body.recipeId,
            "Products": [],
            "SkipTime": 0,
            "StartTime": Math.floor(Date.now() / 1000)
        };

        return output;
    }

    continuousProductionStart(pmcData, body, sessionID)
    {
        this.registerProduction(pmcData, body, sessionID);
        return item_f.itemServer.getOutput();
    }

    getBTC(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        const bitCoinCount = pmcData.Hideout.Production[areaTypes.BITCOIN_FARM]?.Products?.length;
        if (!bitCoinCount)
        {
            logger.logError("No bitcoins are ready for pickup!");
            return itm_hf.appendErrorToOutput(output);
        }

        let newBTC = {
            "items": [{
                "item_id": "59faff1d86f7746c51718c9c",
                "count": pmcData.Hideout.Production[areaTypes.BITCOIN_FARM].Products.length,
            }],
            "tid": "ragfair"
        };

        let callback = () =>
        {
            pmcData.Hideout.Production[areaTypes.BITCOIN_FARM].Products = [];
        };

        return move_f.addItem(pmcData, newBTC, output, sessionID, callback, true);
    }

    takeProduction(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        if (body.recipeId === "5d5c205bd582a50d042a3c0e")
        {
            return this.getBTC(pmcData, body, sessionID);
        }

        let recipe = database_f.database.tables.hideout.production.find(r => r._id === body.recipeId);
        if (recipe)
        {
            // create item and throw it into profile
            let id = recipe.endProduct;

            // replace the base item with its main preset
            if (preset_f.itemPresets.hasPreset(id))
            {
                id = preset_f.itemPresets.getStandardPreset(id)._id;
            }

            let newReq = {
                "items": [{
                    "item_id": id,
                    "count": recipe.count,
                }],
                "tid": "ragfair"
            };

            const kvp = Object.entries(pmcData.Hideout.Production).find(kvp => kvp[1].RecipeId === body.recipeId);
            if (!kvp || !kvp[0])
            {
                logger.logError(`Could not find production in pmcData with RecipeId ${body.recipeId}`);
                return itm_hf.appendErrorToOutput(output);
            }

            // delete the production in profile Hideout.Production if addItem passes validation
            let callback = () =>
            {
                delete pmcData.Hideout.Production[kvp[0]];
            };

            return move_f.addItem(pmcData, newReq, output, sessionID, callback, true);
        }

        recipe = database_f.database.tables.hideout.scavcase.find(r => r._id === body.recipeId);
        if (recipe)
        {
            const kvp = Object.entries(pmcData.Hideout.Production).find(kvp => kvp[1].RecipeId === body.recipeId);
            if (!kvp || !kvp[0])
            {
                logger.logError(`Could not find production in pmcData with RecipeId ${body.recipeId}`);
                return itm_hf.appendErrorToOutput(output);
            }
            const prod = kvp[0];

            pmcData.Hideout.Production[prod].Products = pmcData.Hideout.Production[areaTypes.SCAV_CASE_ITEMS].Products;

            const itemsToAdd = pmcData.Hideout.Production[prod].Products.map(x =>
            {
                return { "item_id": x._tpl, "count": 1 };
            });

            const newReq = {
                "items": itemsToAdd,
                "tid": "ragfair"
            };

            const callback = () =>
            {
                delete pmcData.Hideout.Production[prod];
                delete pmcData.Hideout.Production[areaTypes.SCAV_CASE_ITEMS];
            };

            return move_f.addItem(pmcData, newReq, output, sessionID, callback, true);
        }

        logger.logError(`Failed to locate any recipe with id ${body.recipeId}`);
        return itm_hf.appendErrorToOutput(output);
    }

    registerProduction(pmcData, body, sessionID)
    {
        const recipe = database_f.database.tables.hideout.production.find(p => p._id === body.recipeId);
        if (!recipe)
        {
            logger.logError(`Failed to locate recipe with _id ${body.recipeId}`);
            return itm_hf.appendErrorToOutput(item_f.itemServer.getOutput());
        }

        pmcData.Hideout.Production[recipe.areaType] = {
            "Progress": 0,
            "inProgress": true,
            "RecipeId": body.recipeId,
            "Products": [],
            "SkipTime": 0,
            "StartTime": Math.floor(Date.now() / 1000)
        };
    }

    // BALIST0N, I got bad news for you
    // we do need to implement these after all
    // ...
    // with that I mean manual implementation
    // RIP, GL whoever is going to do this
    applyPlayerUpgradesBonuses(pmcData, bonus)
    {
        switch (bonus.type)
        {
            case "StashSize":

                for (let item in pmcData.Inventory.items)
                {
                    if (pmcData.Inventory.items[item]._id == pmcData.Inventory.stash)
                    {
                        pmcData.Inventory.items[item]._tpl = bonus.templateId;
                    }
                }
                break;

            case "MaximumEnergyReserve":
                pmcData.Health.Energy.Maximum = 110;
                break;

            case "EnergyRegeneration":
                break;

            case "HydrationRegeneration":
                break;

            case "HealthRegeneration":
                break;

            case "DebuffEndDelay":
                break;

            case "ScavCooldownTimer":
                break;

            case "QuestMoneyReward":
                break;

            case "InsuranceReturnTime":
                break;

            case "ExperienceRate":
                break;

            case "SkillGroupLevelingBoost":
                break;

            case "RagfairCommission":
                break;

            case "AdditionalSlots":
                break;

            case "UnlockWeaponModification":
                break;

            case "TextBonus":
                break;

            case "FuelConsumption":
                break;
        }

        pmcData.Bonuses.push(bonus);
    }

    updatePlayerHideout(sessionID)
    {
        const recipes = database_f.database.tables.hideout.production;
        let pmcData = profile_f.profileServer.getPmcProfile(sessionID);
        let btcFarmCGs = 0;
        let isGeneratorOn = false;

        const solarArea = pmcData.Hideout.Areas.find(area => area.type === 18);
        const solarPowerLevel = solarArea ? solarArea.level : 0;

        for (let area of pmcData.Hideout.Areas)
        {
            switch (area.type)
            {
                case areaTypes.GENERATOR:
                    isGeneratorOn = area.active;
                    if (isGeneratorOn)
                    {
                        // TODO: Check if solarPowerLevel gets updated as expected and is used properly
                        area = this.updateFuel(area, solarPowerLevel);
                    }
                    break;

                case areaTypes.AIR_FILTERING:
                    if (isGeneratorOn)
                    {
                        area = this.updateAirFilters(area);
                    }
                    break;

                case areaTypes.BITCOIN_FARM:
                    for (let slot of area.slots)
                    {
                        if (slot.item)
                        {
                            btcFarmCGs++;
                        }
                    }
                    break;
            }
        }

        // update production time
        for (let prod in pmcData.Hideout.Production)
        {
            if (!pmcData.Hideout.Production[prod].inProgress)
            {
                continue;
            }

            if (prod == areaTypes.SCAV_CASE)
            {
                const time_elapsed = (Math.floor(Date.now() / 1000) - pmcData.Hideout.Production[prod].StartTime) - pmcData.Hideout.Production[prod].Progress;
                pmcData.Hideout.Production[prod].Progress += time_elapsed;
                continue;
            }

            if (prod == areaTypes.BITCOIN_FARM)
            {
                pmcData.Hideout.Production[prod] = this.updateBitcoinFarm(pmcData.Hideout.Production[prod], btcFarmCGs, isGeneratorOn);
                continue;
            }

            const recipe = recipes.find(r => r._id === pmcData.Hideout.Production[prod].RecipeId);
            if (!recipe)
            {
                logger.logError(`Could not find recipe ${pmcData.Hideout.Production[prod].RecipeId} for area type ${prod}`);
                continue;
            }

            let time_elapsed = (Math.floor(Date.now() / 1000) - pmcData.Hideout.Production[prod].StartTime) - pmcData.Hideout.Production[prod].Progress;
            if (recipe.continuous && !isGeneratorOn)
            {
                time_elapsed = time_elapsed * 0.2;
            }
            pmcData.Hideout.Production[prod].Progress += time_elapsed;
        }
    }

    updateFuel(generatorArea, solarPower)
    {
        const fuelDrainRate = solarPower == 1 ? 0.0332 : 0.0665;
        let hasAnyFuelRemaining = false;

        for (let i = 0; i < generatorArea.slots.length; i++)
        {
            if (!generatorArea.slots[i].item)
            {
                continue;
            }
            else
            {
                let resourceValue = generatorArea.slots[i].item[0].upd?.Resource?.Value;
                if (!resourceValue)
                {
                    resourceValue = 100 - fuelDrainRate;
                }
                else
                {
                    resourceValue -= fuelDrainRate;
                }
                resourceValue = Math.round(resourceValue * 10000) / 10000;

                if (resourceValue > 0)
                {
                    generatorArea.slots[i].item[0].upd = {
                        "StackObjectsCount": 1,
                        "Resource": {
                            "Value": resourceValue
                        }
                    };
                    console.log(`Generator: ${resourceValue} fuel left on tank slot ${i + 1}`);
                    hasAnyFuelRemaining = true;
                    break; // Break here to avoid updating all the fuel tanks
                }
                else
                {
                    generatorArea.slots[i].item[0].upd = {
                        "StackObjectsCount": 1,
                        "Resource": {
                            "Value": 0
                        }
                    };
                }

            }
        }

        if (!hasAnyFuelRemaining)
        {
            generatorArea.active = false;
        }

        return generatorArea;
    }

    updateAirFilters(airFilterArea)
    {
        const filterDrainRate = 0.00417;

        for (let i = 0; i < airFilterArea.slots.length; i++)
        {
            if (!airFilterArea.slots[i].item)
            {
                continue;
            }
            else
            {
                let resourceValue = airFilterArea.slots[i].item[0].upd?.Resource?.Value;
                if (!resourceValue)
                {
                    resourceValue = 300 - filterDrainRate;
                }
                else
                {
                    resourceValue -= filterDrainRate;
                }
                resourceValue = Math.round(resourceValue * 10000) / 10000;

                if (resourceValue > 0)
                {
                    airFilterArea.slots[i].item[0].upd = {
                        "StackObjectsCount": 1,
                        "Resource": {
                            "Value": resourceValue
                        }
                    };
                    console.log(`Air filter: ${resourceValue} filter left on slot ${i + 1}`);
                }
                else
                {
                    airFilterArea.slots[i].item[0] = null;
                }
                break;
            }
        }

        return airFilterArea;
    }

    updateBitcoinFarm(btcProd, btcFarmCGs, isGeneratorOn)
    {
        const time_elapsed = (Math.floor(Date.now() / 1000)) - btcProd.StartTime;

        if (isGeneratorOn)
        {
            btcProd.Progress += time_elapsed;
        }

        const t2 = Math.pow((0.05 + (btcFarmCGs - 1) / 49 * 0.15), -1); // Function to reduce production time based on amount of GPU's
        const final_prodtime = Math.floor(t2 * 3600);

        while (btcProd.Progress > final_prodtime)
        {
            if (btcProd.Products.length < 3)
            {
                btcProd.Products.push({
                    "_id": utility.generateNewItemId(),
                    "_tpl": "59faff1d86f7746c51718c9c",
                    "upd": {
                        "StackObjectsCount": 1
                    }
                });
                btcProd.Progress -= final_prodtime;
            }
            else
            {
                btcProd.Progress = 0;
            }
        }

        btcProd.StartTime = (Math.floor(Date.now() / 1000)); // TODO: Find out if this isn't causing problems
        return btcProd;
    }
}

class HideoutCallbacks
{
    constructor()
    {
        item_f.itemServer.addRoute("HideoutUpgrade", this.upgrade.bind());
        item_f.itemServer.addRoute("HideoutUpgradeComplete", this.upgradeComplete.bind());
        item_f.itemServer.addRoute("HideoutPutItemsInAreaSlots", this.putItemsInAreaSlots.bind());
        item_f.itemServer.addRoute("HideoutTakeItemsFromAreaSlots", this.takeItemsFromAreaSlots.bind());
        item_f.itemServer.addRoute("HideoutToggleArea", this.toggleArea.bind());
        item_f.itemServer.addRoute("HideoutSingleProductionStart", this.singleProductionStart.bind());
        item_f.itemServer.addRoute("HideoutScavCaseProductionStart", this.scavCaseProductionStart.bind());
        item_f.itemServer.addRoute("HideoutContinuousProductionStart", this.continuousProductionStart.bind());
        item_f.itemServer.addRoute("HideoutTakeProduction", this.takeProduction.bind());
    }

    upgrade(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.upgrade(pmcData, body, sessionID);
    }

    upgradeComplete(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.upgradeComplete(pmcData, body, sessionID);
    }

    putItemsInAreaSlots(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.putItemsInAreaSlots(pmcData, body, sessionID);
    }

    takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.takeItemsFromAreaSlots(pmcData, body, sessionID);
    }

    toggleArea(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.toggleArea(pmcData, body, sessionID);
    }

    singleProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.singleProductionStart(pmcData, body, sessionID);
    }

    scavCaseProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.scavCaseProductionStart(pmcData, body, sessionID);
    }

    continuousProductionStart(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.continuousProductionStart(pmcData, body, sessionID);
    }

    takeProduction(pmcData, body, sessionID)
    {
        return hideout_f.hideoutController.takeProduction(pmcData, body, sessionID);
    }
}

module.exports.hideoutController = new HideoutController();
module.exports.hideoutCallbacks = new HideoutCallbacks();
