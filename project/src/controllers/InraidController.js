"use strict";

require("../Lib.js");

class InraidController
{
    static onLoad(sessionID)
    {
        let profile = SaveServer.profiles[sessionID];

        if (!("inraid" in profile))
        {
            profile.inraid = {
                "location": "none",
                "character": "none"
            };
        }

        return profile;
    }

    static addPlayer(sessionID, location)
    {
        SaveServer.profiles[sessionID].inraid.location = location;
    }

    static removePlayer(sessionID)
    {
        SaveServer.profiles[sessionID].inraid.location = "none";
    }

    static removeMapAccessKey(offraidData, sessionID)
    {
        const locationName = SaveServer.profiles[sessionID].inraid.location.toLowerCase();
        const mapKey = DatabaseServer.tables.locations[locationName].base.AccessKeys[0];

        if (!mapKey)
        {
            return;
        }

        for (let item of offraidData.profile.Inventory.items)
        {
            if (item._tpl === mapKey && item.slotId !== "Hideout")
            {
                InventoryController.removeItemFromProfile(offraidData.profile, item._id);
                break;
            }
        }
    }

    static saveProgress(offraidData, sessionID)
    {
        if (!InraidConfig.save.loot)
        {
            return;
        }

        let locationName = SaveServer.profiles[sessionID].inraid.location.toLowerCase();

        let map = DatabaseServer.tables.locations[locationName].base;
        let insuranceEnabled = map.Insurance;
        let pmcData = ProfileController.getPmcProfile(sessionID);
        let scavData = ProfileController.getScavProfile(sessionID);
        const isPlayerScav = offraidData.isPlayerScav;
        const isDead = (offraidData.exit !== "survived" && offraidData.exit !== "runner");
        const preRaidGear = (isPlayerScav) ? [] : InraidController.getPlayerGear(pmcData.Inventory.items);

        SaveServer.profiles[sessionID].inraid.character = (isPlayerScav) ? "scav" : "pmc";

        if (!isPlayerScav)
        {
            pmcData = InraidController.setBaseStats(pmcData, offraidData, sessionID);

            // For some reason, offraidData seems to drop the latest insured items.
            // It makes more sense to use profileData's insured items as the source of truth.
            offraidData.profile.InsuredItems = pmcData.InsuredItems;
        }
        else
        {
            scavData = InraidController.setBaseStats(scavData, offraidData, sessionID);
        }

        // Check for exit status
        if (offraidData.exit === "survived")
        {
            // mark found items and replace item ID's if the player survived
            offraidData.profile = InraidController.markFoundItems(pmcData, offraidData.profile, isPlayerScav);
        }
        else
        {
            // Or remove the FIR status if the player havn't survived
            offraidData.profile = InraidController.removeFoundItems(offraidData.profile);
        }

        offraidData.profile.Inventory.items = ItemHelper.replaceIDs(offraidData.profile, offraidData.profile.Inventory.items, offraidData.profile.Inventory.fastPanel);

        // set profile equipment to the raid equipment
        if (isPlayerScav)
        {
            scavData = InraidController.setInventory(scavData, offraidData.profile);
            HealthController.resetVitality(sessionID);
            ProfileController.setScavProfile(sessionID, scavData);
            return;
        }
        else
        {
            pmcData = InraidController.setInventory(pmcData, offraidData.profile);
            HealthController.saveVitality(pmcData, offraidData.health, sessionID);
        }

        // remove inventory if player died and send insurance items
        // TODO: dump of prapor/therapist dialogues that are sent when you die in lab with insurance.
        if (insuranceEnabled)
        {
            InsuranceController.storeLostGear(pmcData, offraidData, preRaidGear, sessionID);
        }

        if (isDead)
        {
            if (insuranceEnabled)
            {
                InsuranceController.storeDeadGear(pmcData, offraidData, preRaidGear, sessionID);
            }

            pmcData = InraidController.deleteInventory(pmcData, sessionID);
            let carriedQuestItems = offraidData.profile.Stats.CarriedQuestItems;

            for (const questItem of carriedQuestItems)
            {
                const conditionId = QuestController.getFindItemIdForQuestItem(questItem);
                QuestController.resetProfileQuestCondition(sessionID, conditionId);
            }

            //Delete carried quests items
            carriedQuestItems = [];
        }

        if (insuranceEnabled)
        {
            InsuranceController.sendInsuredItems(pmcData, sessionID);
        }
    }

    static setBaseStats(profileData, offraidData, sessionID)
    {
        // set profile data
        profileData.Info.Level = offraidData.profile.Info.Level;
        profileData.Skills = offraidData.profile.Skills;
        profileData.Stats = offraidData.profile.Stats;
        profileData.Encyclopedia = offraidData.profile.Encyclopedia;
        profileData.ConditionCounters = offraidData.profile.ConditionCounters;
        profileData.Quests = offraidData.profile.Quests;

        // remove old skill fatigue
        for (let skill in profileData.Skills.Common)
        {
            profileData.Skills.Common[skill].PointsEarnedDuringSession = 0.0;
        }

        // add experience points
        profileData.Info.Experience += profileData.Stats.TotalSessionExperience;
        profileData.Stats.TotalSessionExperience = 0;

        // Remove the Lab card
        InraidController.removeMapAccessKey(offraidData, sessionID);
        InraidController.removePlayer(sessionID);

        return profileData;
    }

    /* adds SpawnedInSession property to items found in a raid */
    static markFoundItems(pmcData, profile, isPlayerScav)
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

    static removeFoundItems(profile)
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

    static setInventory(pmcData, profile)
    {
        const insured = JsonUtil.clone(pmcData.InsuredItems);
        InventoryController.removeItem(pmcData, pmcData.Inventory.equipment, sessionID);
        InventoryController.removeItem(pmcData, pmcData.Inventory.questRaidItems, sessionID);
        InventoryController.removeItem(pmcData, pmcData.Inventory.questStashItems, sessionID);

        for (let item of profile.Inventory.items)
        {
            pmcData.Inventory.items.push(item);
        }

        pmcData.InsuredItems = insured;
        pmcData.Inventory.fastPanel = profile.Inventory.fastPanel;
        pmcData.Inventory.items = ItemHelper.replaceIDs(pmcData, pmcData.Inventory.items, pmcData.Inventory.fastPanel);
        return pmcData;
    }

    static deleteInventory(pmcData, sessionID)
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
            && item.slotId !== "ArmBand"
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
            InventoryController.removeItemFromProfile(pmcData, item);
        }

        pmcData.Inventory.fastPanel = {};
        return pmcData;
    }

    static getPlayerGear(items)
    {
        // Player Slots we care about
        const inventorySlots = [
            "FirstPrimaryWeapon",
            "SecondPrimaryWeapon",
            "Holster",
            "Scabbard",
            "Compass",
            "Headwear",
            "Earpiece",
            "Eyewear",
            "FaceCover",
            "ArmBand",
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

module.exports = InraidController;
