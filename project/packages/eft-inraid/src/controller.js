/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - Emperor06
 * - Ereshkigal
 * - Basuro
 */

"use strict";

class Controller
{
    onLoad(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        if (!("inraid" in profile))
        {
            profile.inraid = {
                "location": "none",
                "character": "none"
            };
        }

        return profile;
    }

    addPlayer(sessionID, info)
    {
        save_f.server.profiles[sessionID].inraid.location = info.Location;
    }

    removePlayer(sessionID)
    {
        save_f.server.profiles[sessionID].inraid.location = "none";
    }

    removeMapAccessKey(offraidData, sessionID)
    {
        let locationName = save_f.server.profiles[sessionID].inraid.location.toLowerCase();
        let map = database_f.server.tables.locations[locationName].base;
        let mapKey = map.AccessKeys[0];

        if (!mapKey)
        {
            return;
        }

        for (let item of offraidData.profile.Inventory.items)
        {
            if (item._tpl === mapKey && item.slotId !== "Hideout")
            {
                let usages = -1;

                if (!helpfunc_f.helpFunctions.getItem(mapKey)[1]._props.MaximumNumberOfUsage)
                {
                    usages = 1;
                }
                else
                {
                    usages = ("upd" in item && "Key" in item.upd) ? item.upd.Key.NumberOfUsages : -1;
                }

                if (usages === -1)
                {
                    item.upd = {"Key": {"NumberOfUsages": 1 }};
                }
                else
                {
                    item.upd.Key.NumberOfUsages += 1;
                }

                if (item.upd.Key.NumberOfUsages >= helpfunc_f.helpFunctions.getItem(mapKey)[1]._props.MaximumNumberOfUsage)
                {
                    inventory_f.controller.removeItemFromProfile(offraidData.profile, item._id);
                }

                break;
            }
        }
    }

    saveProgress(offraidData, sessionID)
    {
        if (!inraid_f.config.save.loot)
        {
            return;
        }

        let locationName = save_f.server.profiles[sessionID].inraid.location.toLowerCase();

        let map = database_f.server.tables.locations[locationName].base;
        let insuranceEnabled = map.Insurance;
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let scavData = profile_f.controller.getScavProfile(sessionID);
        const isPlayerScav = offraidData.isPlayerScav;
        const isDead = (offraidData.exit !== "survived" && offraidData.exit !== "runner");
        const preRaidGear = (isPlayerScav) ? [] : this.getPlayerGear(pmcData.Inventory.items);

        save_f.server.profiles[sessionID].inraid.character = (isPlayerScav) ? "scav" : "pmc";

        if (!isPlayerScav)
        {
            // set pmc data
            pmcData.Info.Level = offraidData.profile.Info.Level;
            pmcData.Skills = offraidData.profile.Skills;
            pmcData.Stats = offraidData.profile.Stats;
            pmcData.Encyclopedia = offraidData.profile.Encyclopedia;
            pmcData.ConditionCounters = offraidData.profile.ConditionCounters;
            pmcData.Quests = offraidData.profile.Quests;

            // remove old skill fatigue
            for (let skill in pmcData.Skills.Common)
            {
                pmcData.Skills.Common[skill].PointsEarnedDuringSession = 0.0;
            }

            // For some reason, offraidData seems to drop the latest insured items.
            // It makes more sense to use pmcData's insured items as the source of truth.
            offraidData.profile.InsuredItems = pmcData.InsuredItems;

            // add experience points
            pmcData.Info.Experience += pmcData.Stats.TotalSessionExperience;
            pmcData.Stats.TotalSessionExperience = 0;

            // Remove the Lab card
            inraid_f.controller.removeMapAccessKey(offraidData, sessionID);
            inraid_f.controller.removePlayer(sessionID);
        }

        // Check for exit status
        if (offraidData.exit === "survived")
        {
            // mark found items and replace item ID's if the player survived
            offraidData.profile = this.markFoundItems(pmcData, offraidData.profile, isPlayerScav);
        }
        else
        {
            // Or remove the FIR status if the player havn't survived
            offraidData.profile = this.removeFoundItems(offraidData.profile);
        }

        offraidData.profile.Inventory.items = helpfunc_f.helpFunctions.replaceIDs(offraidData.profile, offraidData.profile.Inventory.items, offraidData.profile.Inventory.fastPanel);

        // set profile equipment to the raid equipment
        if (isPlayerScav)
        {
            scavData = this.setInventory(scavData, offraidData.profile);
            health_f.controller.resetVitality(sessionID);
            profile_f.controller.setScavProfile(sessionID, scavData);
            return;
        }
        else
        {
            pmcData = this.setInventory(pmcData, offraidData.profile);
            health_f.controller.saveVitality(pmcData, offraidData.health, sessionID);
        }

        // remove inventory if player died and send insurance items
        // TODO: dump of prapor/therapist dialogues that are sent when you die in lab with insurance.
        if (insuranceEnabled)
        {
            insurance_f.controller.storeLostGear(pmcData, offraidData, preRaidGear, sessionID);
        }

        if (isDead)
        {
            if (insuranceEnabled)
            {
                insurance_f.controller.storeDeadGear(pmcData, offraidData, preRaidGear, sessionID);
            }

            pmcData = this.deleteInventory(pmcData, sessionID);
            let carriedQuestItems = offraidData.profile.Stats.CarriedQuestItems;

            for (const questItem of carriedQuestItems)
            {
                const conditionId = quest_f.controller.getFindItemIdForQuestItem(questItem);
                profile_f.controller.resetProfileQuestCondition(sessionID, conditionId);
            }

            //Delete carried quests items
            carriedQuestItems = [];
        }

        if (insuranceEnabled)
        {
            insurance_f.controller.sendInsuredItems(pmcData, sessionID);
        }
    }

    /* adds SpawnedInSession property to items found in a raid */
    markFoundItems(pmcData, profile, isPlayerScav)
    {
        // mark items found in raid
        for (let offraidItem of profile.Inventory.items)
        {
            let found = false;

            // mark new items for PMC, mark all items for scavs
            if (!isPlayerScav)
            {
                // check if the item exists
                for (let item of pmcData.Inventory.items)
                {
                    if (offraidItem._id === item._id)
                    {
                        found = true;
                        break;
                    }
                }

                if (found)
                {
                    // if the item exists and is taken inside the raid, remove the taken in raid status
                    if ("upd" in offraidItem && "SpawnedInSession" in offraidItem.upd)
                    {
                        delete offraidItem.upd.SpawnedInSession;
                    }

                    continue;
                }
            }

            // mark item found in raid
            if ("upd" in offraidItem)
            {
                offraidItem.upd.SpawnedInSession = true;
            }
            else
            {
                offraidItem.upd = {"SpawnedInSession": true};
            }
        }

        return profile;
    }

    removeFoundItems(profile)
    {
        for (let offraidItem of profile.Inventory.items)
        {
            // Remove the FIR status if the player died and the item marked FIR
            if ("upd" in offraidItem && "SpawnedInSession" in offraidItem.upd)
            {
                delete offraidItem.upd.SpawnedInSession;
            }

            continue;
        }

        return profile;
    }

    setInventory(pmcData, profile)
    {
        inventory_f.controller.removeItemFromProfile(pmcData, pmcData.Inventory.equipment);
        inventory_f.controller.removeItemFromProfile(pmcData, pmcData.Inventory.questRaidItems);
        inventory_f.controller.removeItemFromProfile(pmcData, pmcData.Inventory.questStashItems);

        for (let item of profile.Inventory.items)
        {
            pmcData.Inventory.items.push(item);
        }
        pmcData.Inventory.fastPanel = profile.Inventory.fastPanel;

        return pmcData;
    }

    deleteInventory(pmcData, sessionID)
    {
        let toDelete = [];

        for (let item of pmcData.Inventory.items)
        {
            // remove normal item
            if (item.parentId === pmcData.Inventory.equipment
            && item.slotId !== "SecuredContainer"
            && item.slotId !== "Scabbard"
            && item.slotId !== "Pockets"
            && item.slotId !== "Compass"
            || item.parentId === pmcData.Inventory.questRaidItems)
            {
                toDelete.push(item._id);
            }

            // remove pocket insides
            if (item.slotId === "Pockets")
            {
                for (let pocket of pmcData.Inventory.items)
                {
                    if (pocket.parentId === item._id)
                    {
                        toDelete.push(pocket._id);
                    }
                }
            }
        }

        // delete items
        for (let item of toDelete)
        {
            inventory_f.controller.removeItemFromProfile(pmcData, item);
        }

        pmcData.Inventory.fastPanel = {};
        return pmcData;
    }

    getPlayerGear(items)
    {
        // Player Slots we care about
        const inventorySlots = [
            "FirstPrimaryWeapon",
            "SecondPrimaryWeapon",
            "Holster",
            "Scabbard",
            "Headwear",
            "Earpiece",
            "Eyewear",
            "FaceCover",
            "ArmBand",
            "Compass",
            "ArmorVest",
            "TacticalVest",
            "Backpack",
            "pocket1",
            "pocket2",
            "pocket3",
            "pocket4",
            "SecuredContainer"
        ];

        let inventoryItems = [];

        // Get an array of root player items
        for (let item of items)
        {
            if (inventorySlots.includes(item.slotId))
            {
                inventoryItems.push(item);
            }
        }

        // Loop through these items and get all of their children
        let newItems = inventoryItems;
        while (newItems.length > 0)
        {
            let foundItems = [];

            for (let item of newItems)
            {
                // Find children of this item
                for (let newItem of items)
                {
                    if (newItem.parentId === item._id)
                    {
                        foundItems.push(newItem);
                    }
                }
            }

            // Add these new found items to our list of inventory items
            inventoryItems = [
                ...inventoryItems,
                ...foundItems,
            ];

            // Now find the children of these items
            newItems = foundItems;
        }

        return inventoryItems;
    }
}

module.exports.Controller = Controller;
