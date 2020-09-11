"use strict";

class HideoutController
{
    upgrade(pmcData, body, sessionID)
    {
        for (let itemToPay of body.items)
        {
            for (let item of pmcData.Inventory.items)
            {
                if (item._id !== itemToPay.id)
                {
                    continue;
                }

                // if it's not money, its construction / barter items
                if (item._tpl === "5449016a4bdc2d6f028b456f")
                {
                    item.upd.StackObjectsCount -= itemToPay.count;
                }
                else
                {
                    move_f.removeItem(pmcData, item._id, item_f.itemServer.getOutput(), sessionID);
                }
            }
        }

        // time construction management
        for (let hideoutArea in pmcData.Hideout.Areas)
        {
            if (pmcData.Hideout.Areas[hideoutArea].type !== body.areaType)
            {
                continue;
            }

            for (let hideout_stage in database_f.database.tables.hideout.areas)
            {
                if (database_f.database.tables.hideout.areas[hideout_stage].type === body.areaType)
                {
                    let ctime = database_f.database.tables.hideout.areas[hideout_stage].stages[pmcData.Hideout.Areas[hideoutArea].level + 1].constructionTime;

                    if (ctime > 0)
                    {
                        let timestamp = Math.floor(Date.now() / 1000);

                        pmcData.Hideout.Areas[hideoutArea].completeTime = timestamp + ctime;
                        pmcData.Hideout.Areas[hideoutArea].constructing = true;
                    }
                }
            }
        }

        return item_f.itemServer.getOutput();
    }

    // validating the upgrade
    upgradeComplete(pmcData, body, sessionID)
    {
        for (let hideoutArea in pmcData.Hideout.Areas)
        {
            if (pmcData.Hideout.Areas[hideoutArea].type !== body.areaType)
            {
                continue;
            }

            // upgrade area
            pmcData.Hideout.Areas[hideoutArea].level++;
            pmcData.Hideout.Areas[hideoutArea].completeTime = 0;
            pmcData.Hideout.Areas[hideoutArea].constructing = false;

            //go to apply bonuses
            for (let area_bonus of database_f.database.tables.hideout.areas)
            {
                if (area_bonus.type !== pmcData.Hideout.Areas[hideoutArea].type)
                {
                    continue;
                }

                let bonuses = area_bonus.stages[pmcData.Hideout.Areas[hideoutArea].level].bonuses;

                if (bonuses.length > 0)
                {
                    for (let bonus of bonuses)
                    {
                        this.applyPlayerUpgradesBonuses(pmcData, bonus);
                    }
                }
            }
        }

        return item_f.itemServer.getOutput();
    }

    // move items from hideout
    putItemsInAreaSlots(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        for (let itemToMove in body.items)
        {
            for (let inventoryItem of pmcData.Inventory.items)
            {
                if (body.items[itemToMove].id !== inventoryItem._id)
                {
                    continue;
                }

                for (let area of pmcData.Hideout.Areas)
                {
                    if (area.type !== body.areaType)
                    {
                        continue;
                    }

                    let slot_position = parseInt(itemToMove);
                    let slot_to_add = {
                        "item": [{
                            "_id": inventoryItem._id,
                            "_tpl": inventoryItem._tpl,
                            "upd": inventoryItem.upd
                        }]
                    };

                    if (!(slot_position in area.slots))
                    {
                        area.slots.push(slot_to_add);
                    }
                    else
                    {
                        area.slots.splice(slot_position, 1, slot_to_add);
                    }

                    output = move_f.removeItem(pmcData, inventoryItem._id, output, sessionID);
                }
            }
        }

        return output;
    }

    takeItemsFromAreaSlots(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();

        for (let area of pmcData.Hideout.Areas)
        {
            if (area.type !== body.areaType)
            {
                continue;
            }

            if (area.type === 4)
            {
                let itemToMove = area.slots[body.slots[0]].item[0];
                let newReq = {
                    "items": [{
                        "item_id": itemToMove._tpl,
                        "count": 1,
                    }],
                    "tid": "ragfair"
                };

                output = move_f.addItem(pmcData, newReq, output, sessionID, null);

                // If addItem returned with errors, don't continue any further
                if (output.badRequest && output.badRequest.length > 0)
                {
                    return output;
                }

                pmcData = profile_f.profileServer.getPmcProfile(sessionID);
                output.items.new[0].upd = itemToMove.upd;

                for (let item of pmcData.Inventory.items)
                {
                    if (item._id == output.items.new[0]._id)
                    {
                        item.upd = itemToMove.upd;
                    }
                }

                area.slots[body.slots[0]] = {
                    "item": null
                };
            }
            else
            {
                let newReq = {
                    "items": [{
                        "item_id": area.slots[0].item[0]._tpl,
                        "count": 1,
                    }],
                    "tid": "ragfair"
                };

                output = move_f.addItem(pmcData, newReq, output, sessionID, null);

                // If addItem returned with errors, don't continue any further
                if (output.badRequest && output.badRequest.length > 0)
                {
                    return output;
                }

                pmcData = profile_f.profileServer.getPmcProfile(sessionID);
                area.slots.splice(0, 1);
            }
        }

        return output;
    }

    toggleArea(pmcData, body, sessionID)
    {
        for (let area in pmcData.Hideout.Areas)
        {
            if (pmcData.Hideout.Areas[area].type == body.areaType)
            {
                pmcData.Hideout.Areas[area].active = body.enabled;
            }
        }

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
        for (let moneyToEdit of body.items)
        {
            for (let inventoryItem in pmcData.Inventory.items)
            {
                if (pmcData.Inventory.items[inventoryItem]._id === moneyToEdit.id)
                {
                    pmcData.Inventory.items[inventoryItem].upd.StackObjectsCount -= moneyToEdit.count;
                }
                else
                {
                    for (let itemToDelete of body.items)
                    {
                        output = move_f.removeItem(pmcData, itemToDelete.id, output, sessionID);
                    }
                }
            }
        }

        for (let recipe in database_f.database.tables.hideout.scavcase)
        {
            if (body.recipeId == database_f.database.tables.hideout.scavcase[recipe]._id)
            {
                let rarityItemCounter = {};
                let products = [];

                for (let rarity in database_f.database.tables.hideout.scavcase[recipe].EndProducts)
                {
                    if (database_f.database.tables.hideout.scavcase[recipe].EndProducts[rarity].max > 0)
                    {
                        rarityItemCounter[rarity] = database_f.database.tables.hideout.scavcase[recipe].EndProducts[rarity].max;
                    }
                }

                for (let rarityType in rarityItemCounter)
                {
                    while (rarityItemCounter[rarityType] !== 0)
                    {
                        let random = utility.getRandomIntEx(Object.keys(database_f.database.tables.templates.items).length);
                        let randomKey = Object.keys(database_f.database.tables.templates.items)[random];
                        let tempItem = database_f.database.tables.templates.items[randomKey];

                        // products are not registered correctly
                        if (tempItem._props.Rarity === rarityType)
                        {
                            products.push({
                                "_id": utility.generateNewItemId(),
                                "_tpl": tempItem._id
                            });

                            rarityItemCounter[rarityType] -= 1;
                        }
                    }
                }
                pmcData.Hideout.Production["141"] = {
                    "Products": products
                };
                pmcData.Hideout.Production["14"] = {
                    "Progress": 0,
                    "inProgress": true,
                    "RecipeId": body.recipeId,
                    "Products": [],
                    "SkipTime": 0,
                    "StartTime": Math.floor(Date.now() / 1000)
                };
            }
        }

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

        let newBTC = {
            "items": [{
                "item_id": "59faff1d86f7746c51718c9c",
                "count": pmcData.Hideout.Production["20"].Products.length,
            }],
            "tid": "ragfair"
        };

        let callback = () =>
        {
            pmcData.Hideout.Production["20"].Products = [];
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

        for (let recipe in database_f.database.tables.hideout.production)
        {
            if (body.recipeId !== database_f.database.tables.hideout.production[recipe]._id)
            {
                continue;
            }

            // create item and throw it into profile
            let id = database_f.database.tables.hideout.production[recipe].endProduct;

            // replace the base item with its main preset
            if (preset_f.itemPresets.hasPreset(id))
            {
                id = preset_f.itemPresets.getStandardPreset(id)._id;
            }

            let newReq = {
                "items": [{
                    "item_id": id,
                    "count": database_f.database.tables.hideout.production[recipe].count,
                }],
                "tid": "ragfair"
            };

            // delete the production in profile Hideout.Production if addItem passes validation
            let callback = () =>
            {
                for (let prod in pmcData.Hideout.Production)
                {
                    if (pmcData.Hideout.Production[prod].RecipeId === body.recipeId)
                    {
                        delete pmcData.Hideout.Production[prod];
                    }
                }
            };

            return move_f.addItem(pmcData, newReq, output, sessionID, callback, true);
        }

        for (let recipe in database_f.database.tables.hideout.scavcase)
        {
            if (body.recipeId !== database_f.database.tables.hideout.scavcase[recipe]._id)
            {
                continue;
            }

            for (let prod in pmcData.Hideout.Production)
            {
                if (pmcData.Hideout.Production[prod].RecipeId !== body.recipeId)
                {
                    continue;
                }

                pmcData.Hideout.Production[prod].Products = pmcData.Hideout.Production["141"].Products;

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
                    delete pmcData.Hideout.Production["141"];
                };

                return move_f.addItem(pmcData, newReq, output, sessionID, callback, true);
            }
        }

        return "";
    }

    registerProduction(pmcData, body, sessionID)
    {
        for (let recipe in database_f.database.tables.hideout.production)
        {
            if (body.recipeId === database_f.database.tables.hideout.production[recipe]._id)
            {
                pmcData.Hideout.Production[database_f.database.tables.hideout.production[recipe].areaType] = {
                    "Progress": 0,
                    "inProgress": true,
                    "RecipeId": body.recipeId,
                    "Products": [],
                    "SkipTime": 0,
                    "StartTime": Math.floor(Date.now() / 1000)
                };
            }
        }
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
