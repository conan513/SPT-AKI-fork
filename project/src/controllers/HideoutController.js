/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Terkoiz
 * - Ereshkigal
 */

"use strict";

const HideoutConfig = require("../configs/HideoutConfig.json");

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
    CHRISTMAS_TREE: 21
};

// Production recipe made from these areas
const BITCOIN_FARM = "5d5c205bd582a50d042a3c0e";
const WATER_COLLECTOR = "5d5589c1f934db045e6c5492";

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
                Logger.error(`Failed to find item in inventory with id ${item.requestedItem.id}`);
                return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
            }

            if (Helpers.isMoneyTpl(item.inventoryItem._tpl)
                && item.inventoryItem.upd
                && item.inventoryItem.upd.StackObjectsCount
                && item.inventoryItem.upd.StackObjectsCount > item.requestedItem.count)
            {
                item.inventoryItem.upd.StackObjectsCount -= item.requestedItem.count;
            }
            else
            {
                inventory_f.controller.removeItem(pmcData, item.inventoryItem._id, item_f.eventHandler.getOutput(), sessionID);
            }
        }

        // Construction time management
        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            Logger.error(`Could not find area of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
        }

        const hideoutData = database_f.server.tables.hideout.areas.find(area => area.type === body.areaType);
        if (!hideoutData)
        {
            Logger.error(`Could not find area in database of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
        }

        let ctime = hideoutData.stages[hideoutArea.level + 1].constructionTime;
        if (ctime > 0)
        {
            let timestamp = TimeUtil.getTimestamp();

            hideoutArea.completeTime = timestamp + ctime;
            hideoutArea.constructing = true;
        }

        return item_f.eventHandler.getOutput();
    }

    upgradeComplete(pmcData, body, sessionID)
    {
        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            Logger.error(`Could not find area of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
        }

        // Upgrade area
        hideoutArea.level++;
        hideoutArea.completeTime = 0;
        hideoutArea.constructing = false;

        const hideoutData = database_f.server.tables.hideout.areas.find(area => area.type === hideoutArea.type);
        if (!hideoutData)
        {
            Logger.error(`Could not find area in database of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
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

        return item_f.eventHandler.getOutput();
    }

    // Move items from hideout
    putItemsInAreaSlots(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

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
            Logger.error(`Could not find area of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(output);
        }

        for (let item of items)
        {
            if (!item.inventoryItem)
            {
                Logger.error(`Failed to find item in inventory with id ${item.requestedItem.id}`);
                return https_f.response.appendErrorToOutput(output);
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

            output = inventory_f.controller.removeItem(pmcData, item.inventoryItem._id, output, sessionID);
        }

        return output;
    }

    takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

        const hideoutArea = pmcData.Hideout.Areas.find(area => area.type === body.areaType);
        if (!hideoutArea)
        {
            Logger.error(`Could not find area of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(output);
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

            output = inventory_f.controller.addItem(pmcData, newReq, output, sessionID, null);

            // If addItem returned with errors, don't continue any further
            if (output.badRequest && output.badRequest.length > 0)
            {
                return output;
            }

            pmcData = profile_f.controller.getPmcProfile(sessionID);
            output.items.new[0].upd = itemToMove.upd;

            const item = pmcData.Inventory.items.find(i => i._id === output.items.new[0]._id);
            if (item)
            {
                item.upd = itemToMove.upd;
            }
            else
            {
                Logger.error(`Could not find item in inventory with id ${output.items.new[0]._id}`);
            }

            hideoutArea.slots[body.slots[0]] = {
                "item": null
            };
        }
        else
        {
            if (!hideoutArea.slots[0] || !hideoutArea.slots[0].item[0] || !hideoutArea.slots[0].item[0]._tpl)
            {
                Logger.error(`Could not find item to take out of slot 0 for areaType ${hideoutArea.type}`);
                return https_f.response.appendErrorToOutput(output);
            }

            let newReq = {
                "items": [{
                    "item_id": hideoutArea.slots[0].item[0]._tpl,
                    "count": 1,
                }],
                "tid": "ragfair"
            };

            output = inventory_f.controller.addItem(pmcData, newReq, output, sessionID, null);

            // If addItem returned with errors, don't continue any further
            if (output.badRequest && output.badRequest.length > 0)
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
            Logger.error(`Could not find area of type ${body.areaType}`);
            return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
        }

        hideoutArea.active = body.enabled;

        return item_f.eventHandler.getOutput();
    }

    singleProductionStart(pmcData, body, sessionID)
    {
        this.registerProduction(pmcData, body, sessionID);

        let output = item_f.eventHandler.getOutput();

        for (let itemToDelete of body.items)
        {
            output = inventory_f.controller.removeItem(pmcData, itemToDelete.id, output, sessionID);
        }

        return output;
    }

    scavCaseProductionStart(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

        for (let requestedItem of body.items)
        {
            const inventoryItem = pmcData.Inventory.items.find(item => item._id === requestedItem.id);
            if (!inventoryItem)
            {
                Logger.error(`Could not find item requested by ScavCase with id ${requestedItem.id}`);
                return https_f.response.appendErrorToOutput(output);
            }

            if (inventoryItem.upd
                && inventoryItem.upd.StackObjectsCount
                && inventoryItem.upd.StackObjectsCount > requestedItem.count)
            {
                inventoryItem.upd.StackObjectsCount -= requestedItem.count;
            }
            else
            {
                output = inventory_f.controller.removeItem(pmcData, requestedItem.id, output, sessionID);
            }
        }

        const recipe = database_f.server.tables.hideout.scavcase.find(r => r._id === body.recipeId);
        if (!recipe)
        {
            Logger.error(`Failed to find Scav Case recipe with id ${body.recipeId}`);
            return https_f.response.appendErrorToOutput(output);
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
                let random = RandomUtil.getIntEx(Object.keys(database_f.server.tables.templates.items).length);
                let randomKey = Object.keys(database_f.server.tables.templates.items)[random];
                let tempItem = database_f.server.tables.templates.items[randomKey];

                if (tempItem._props && tempItem._props.Rarity === rarityType)
                {
                    products.push({
                        "_id": HashUtil.generate(),
                        "_tpl": tempItem._id
                    });

                    rarityItemCounter[rarityType] -= 1;
                }
            }
        }

        pmcData.Hideout.Production.ScavCase = {
            "Products": products
        };

        pmcData.Hideout.Production[body.recipeId] = {
            "Progress": 0,
            "inProgress": true,
            "RecipeId": body.recipeId,
            "Products": [],
            "SkipTime": 0,
            "StartTime": TimeUtil.getTimestamp()
        };

        return output;
    }

    continuousProductionStart(pmcData, body, sessionID)
    {
        this.registerProduction(pmcData, body, sessionID);
        return item_f.eventHandler.getOutput();
    }

    getBTC(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

        const bitCoinCount = pmcData.Hideout.Production[BITCOIN_FARM].Products.length;
        if (!bitCoinCount)
        {
            Logger.error("No bitcoins are ready for pickup!");
            return https_f.response.appendErrorToOutput(output);
        }

        let newBTC = {
            "items": [{
                "item_id": "59faff1d86f7746c51718c9c",
                "count": pmcData.Hideout.Production[BITCOIN_FARM].Products.length,
            }],
            "tid": "ragfair"
        };

        let callback = () =>
        {
            pmcData.Hideout.Production[BITCOIN_FARM].Products = [];
        };

        return inventory_f.controller.addItem(pmcData, newBTC, output, sessionID, callback, true);
    }

    takeProduction(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

        if (body.recipeId === BITCOIN_FARM)
        {
            return this.getBTC(pmcData, body, sessionID);
        }

        let recipe = database_f.server.tables.hideout.production.find(r => r._id === body.recipeId);
        if (recipe)
        {
            // create item and throw it into profile
            let id = recipe.endProduct;

            // replace the base item with its main preset
            if (preset_f.controller.hasPreset(id))
            {
                id = preset_f.controller.getStandardPreset(id)._id;
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
                Logger.error(`Could not find production in pmcData with RecipeId ${body.recipeId}`);
                return https_f.response.appendErrorToOutput(output);
            }

            // delete the production in profile Hideout.Production if addItem passes validation
            let callback = () =>
            {
                delete pmcData.Hideout.Production[kvp[0]];
            };

            return inventory_f.controller.addItem(pmcData, newReq, output, sessionID, callback, true);
        }

        recipe = database_f.server.tables.hideout.scavcase.find(r => r._id === body.recipeId);
        if (recipe)
        {
            const kvp = Object.entries(pmcData.Hideout.Production).find(kvp => kvp[1].RecipeId === body.recipeId);
            if (!kvp || !kvp[0])
            {
                Logger.error(`Could not find production in pmcData with RecipeId ${body.recipeId}`);
                return https_f.response.appendErrorToOutput(output);
            }
            const prod = kvp[0];

            pmcData.Hideout.Production[prod].Products = pmcData.Hideout.Production.ScavCase.Products;

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
                delete pmcData.Hideout.Production.ScavCase;
            };

            return inventory_f.controller.addItem(pmcData, newReq, output, sessionID, callback, true);
        }

        Logger.error(`Failed to locate any recipe with id ${body.recipeId}`);
        return https_f.response.appendErrorToOutput(output);
    }

    registerProduction(pmcData, body, sessionID)
    {
        const recipe = database_f.server.tables.hideout.production.find(p => p._id === body.recipeId);
        if (!recipe)
        {
            Logger.error(`Failed to locate recipe with _id ${body.recipeId}`);
            return https_f.response.appendErrorToOutput(item_f.eventHandler.getOutput());
        }

        pmcData.Hideout.Production[body.recipeId] = {
            "Progress": 0,
            "inProgress": true,
            "RecipeId": body.recipeId,
            "Products": [],
            "SkipTime": 0,
            "StartTime": TimeUtil.getTimestamp()
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
                    if (pmcData.Inventory.items[item]._id === pmcData.Inventory.stash)
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

    update()
    {
        for (const sessionID in save_f.server.profiles)
        {
            if ("Hideout" in save_f.server.profiles[sessionID].characters.pmc)
            {
                this.updatePlayerHideout(sessionID);
            }
        }
    }

    updatePlayerHideout(sessionID)
    {
        const recipes = database_f.server.tables.hideout.production;
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let btcFarmCGs = 0;
        let isGeneratorOn = false;
        let WaterCollectorHasFilter = false;

        const solarArea = pmcData.Hideout.Areas.find(area => area.type === areaTypes.SOLAR_POWER);
        const solarPowerLevel = solarArea ? solarArea.level : 0;

        for (let area of pmcData.Hideout.Areas)
        {
            switch (area.type)
            {
                case areaTypes.GENERATOR:
                    isGeneratorOn = area.active;

                    if (isGeneratorOn)
                    {
                        area = this.updateFuel(area, solarPowerLevel);
                    }
                    break;

                case areaTypes.WATER_COLLECTOR:
                    if (area.level === 3)
                    {
                        const prod = pmcData.Hideout.Production[WATER_COLLECTOR];
                        if (prod)
                        {
                            area = this.updateWaterFilters(area, prod, isGeneratorOn);
                        }
                        else
                        {
                            // continuousProductionStart()
                            // seem to not trigger consistently
                            const recipe = { "recipeId": WATER_COLLECTOR };
                            this.registerProduction(pmcData, recipe, sessionID);
                        }

                        for (let slot of area.slots)
                        {
                            if (slot.item)
                            {
                                WaterCollectorHasFilter = true;
                                break;
                            }
                        }
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
            const scavCaseRecipe = database_f.server.tables.hideout.scavcase.find(r => r._id === prod);
            if (!pmcData.Hideout.Production[prod].inProgress)
            {
                continue;
            }

            if (scavCaseRecipe)
            {
                const time_elapsed = (TimeUtil.getTimestamp() - pmcData.Hideout.Production[prod].StartTime) - pmcData.Hideout.Production[prod].Progress;
                pmcData.Hideout.Production[prod].Progress += time_elapsed;
                continue;
            }

            if (prod === WATER_COLLECTOR)
            {
                let time_elapsed = (TimeUtil.getTimestamp() - pmcData.Hideout.Production[prod].StartTime) - pmcData.Hideout.Production[prod].Progress;
                if (!isGeneratorOn)
                {
                    time_elapsed = Math.floor(time_elapsed * 0.2);
                }

                if (WaterCollectorHasFilter)
                {
                    pmcData.Hideout.Production[prod].Progress += time_elapsed;
                }
                continue;
            }

            if (prod === BITCOIN_FARM)
            {
                pmcData.Hideout.Production[prod] = this.updateBitcoinFarm(pmcData.Hideout.Production[prod], btcFarmCGs, isGeneratorOn);
                continue;
            }

            const recipe = recipes.find(r => r._id === prod);
            if (!recipe)
            {
                Logger.error(`Could not find recipe ${prod} for area type ${recipes.areaType}`);
                continue;
            }

            let time_elapsed = (TimeUtil.getTimestamp() - pmcData.Hideout.Production[prod].StartTime) - pmcData.Hideout.Production[prod].Progress;
            if (recipe.continuous && !isGeneratorOn)
            {
                time_elapsed = Math.floor(time_elapsed * 0.2);
            }
            pmcData.Hideout.Production[prod].Progress += time_elapsed;
        }
    }

    updateFuel(generatorArea, solarPower)
    {
        // 1 resource last 14 min 27 sec, 1/14.45/60 = 0.00115
        let fuelDrainRate = 0.00115 * HideoutConfig.runInterval;
        fuelDrainRate = solarPower === 1 ? fuelDrainRate / 2 : fuelDrainRate;
        let hasAnyFuelRemaining = false;

        for (let i = 0; i < generatorArea.slots.length; i++)
        {
            if (!generatorArea.slots[i].item)
            {
                continue;
            }
            else
            {
                let resourceValue = (generatorArea.slots[i].item[0].upd && generatorArea.slots[i].item[0].upd.Resource)
                    ? generatorArea.slots[i].item[0].upd.Resource.Value
                    : null;
                if (resourceValue === 0)
                {
                    continue;
                }
                else if (!resourceValue)
                {
                    const fuelItem = "5d1b371186f774253763a656"; // Expeditionary fuel tank
                    resourceValue = generatorArea.slots[i].item[0]._tpl === fuelItem
                        ? resourceValue = 60 - fuelDrainRate
                        : resourceValue = 100 - fuelDrainRate;
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

    updateWaterFilters(waterFilterArea, pwProd, isGeneratorOn)
    {
        let time_elapsed = (TimeUtil.getTimestamp() - pwProd.StartTime) - pwProd.Progress;
        // 100 resources last 8 hrs 20 min, 100/8.33/60/60 = 0.00333
        let filterDrainRate = 0.00333;
        let production_time = 0;

        const recipes = database_f.server.tables.hideout.production;
        for (const prod of recipes)
        {
            if (prod._id === WATER_COLLECTOR)
            {
                production_time = prod.productionTime;
                break;
            }
        }

        if (pwProd.Progress < production_time)
        {
            for (let i = 0; i < waterFilterArea.slots.length; i++)
            {
                if (!waterFilterArea.slots[i].item)
                {
                    continue;
                }
                else
                {
                    if (!isGeneratorOn)
                    {
                        time_elapsed = Math.floor(time_elapsed * 0.2);
                    }
                    filterDrainRate = (time_elapsed > production_time)
                        ? filterDrainRate *= (production_time - pwProd.Progress)
                        : filterDrainRate *= time_elapsed;

                    let resourceValue = (waterFilterArea.slots[i].item[0].upd && waterFilterArea.slots[i].item[0].upd.Resource)
                        ? waterFilterArea.slots[i].item[0].upd.Resource.Value
                        : null;
                    if (!resourceValue)
                    {
                        resourceValue = 100 - filterDrainRate;
                    }
                    else
                    {
                        resourceValue -= filterDrainRate;
                    }
                    resourceValue = Math.round(resourceValue * 10000) / 10000;

                    if (resourceValue > 0)
                    {
                        waterFilterArea.slots[i].item[0].upd = {
                            "StackObjectsCount": 1,
                            "Resource": {
                                "Value": resourceValue
                            }
                        };
                        console.log(`Water filter: ${resourceValue} filter left on slot ${i + 1}`);
                        break; // Break here to avoid updating all filters
                    }
                    else
                    {
                        waterFilterArea.slots[i].item = null;
                    }
                }
            }
        }

        return waterFilterArea;
    }

    updateAirFilters(airFilterArea)
    {
        // 300 resources last 20 hrs, 300/20/60/60 = 0.00416
        const filterDrainRate = 0.00416 * HideoutConfig.runInterval;

        for (let i = 0; i < airFilterArea.slots.length; i++)
        {
            if (!airFilterArea.slots[i].item)
            {
                continue;
            }
            else
            {
                let resourceValue = (airFilterArea.slots[i].item[0].upd && airFilterArea.slots[i].item[0].upd.Resource)
                    ? airFilterArea.slots[i].item[0].upd.Resource.Value
                    : null;
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
                    break; // Break here to avoid updating all filters
                }
                else
                {
                    airFilterArea.slots[i].item = null;
                }
            }
        }

        return airFilterArea;
    }

    updateBitcoinFarm(btcProd, btcFarmCGs, isGeneratorOn)
    {
        const time_elapsed = 4 * (TimeUtil.getTimestamp() - btcProd.StartTime);

        if (isGeneratorOn)
        {
            btcProd.Progress += time_elapsed;
        }

        // Function to reduce production time based on amount of GPU's
        // Client sees 72000 Progress as a bitcoin
        // This need to be updated to be accurate under 50 CGs
        const btcFormula = (0.05 + (btcFarmCGs - 1) / 49 * 0.15);
        const t2 = Math.pow(btcFormula, -1);
        const final_prodtime = Math.floor(t2 * 14400);

        while (btcProd.Progress > final_prodtime)
        {
            if (btcProd.Products.length < 5)
            {
                btcProd.Products.push({
                    "_id": HashUtil.generate(),
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

        btcProd.StartTime = TimeUtil.getTimestamp();
        return btcProd;
    }
}

module.exports = new HideoutController();
