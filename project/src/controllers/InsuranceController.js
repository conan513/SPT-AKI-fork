/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - Emperor06
 */

"use strict";

class InsuranceController
{
    constructor()
    {
        this.insured = {};
        this.templatesById = {};
    }

    onLoad(sessionID)
    {
        this.generateTemplatesById();
        let profile = save_f.server.profiles[sessionID];

        if (!("insurance" in profile))
        {
            profile.insurance = [];
        }

        return profile;
    }

    resetInsurance(sessionID)
    {
        this.insured[sessionID] = {};
    }

    /* remove insurance from an item */
    remove(pmcData, body, sessionID)
    {
        let toDo = [body];

        //Find the item and all of it's relates
        if (toDo[0] === undefined || toDo[0] === null || toDo[0] === "undefined")
        {
            Logger.error("item id is not valid");
            return;
        }

        // get all ids related to this item, +including this item itself
        let ids_toremove = InventoryHelper.findAndReturnChildren(pmcData, toDo[0]);

        for (let i in ids_toremove)
        {
            // remove one by one all related items and itself
            for (let a in pmcData.Inventory.items)
            {
                // find correct item by id and delete it
                if (pmcData.Inventory.items[a]._id === ids_toremove[i])
                {
                    for (let insurance in pmcData.InsuredItems)
                    {
                        if (pmcData.InsuredItems[insurance].itemId === ids_toremove[i])
                        {
                            pmcData.InsuredItems.splice(insurance, 1);
                        }
                    }
                }
            }
        }
    }

    /* adds gear to store */
    addGearToSend(pmcData, insuredItem, actualItem, sessionID)
    {
        // Don't process insurance for melee weapon, secure container, compass or armband.
        if (actualItem.slotId === "Scabbard" || actualItem.slotId === "SecuredContainer" || actualItem.slotId === "Compass" || actualItem.slotId === "ArmBand")
        {
            return;
        }

        const pocketSlots = [
            "pocket1",
            "pocket2",
            "pocket3",
            "pocket4",
        ];

        // Check and correct the validity of the slotId.
        if (!("slotId" in actualItem) || pocketSlots.includes(actualItem.slotId) || !isNaN(actualItem.slotId))
        {
            actualItem.slotId = "hideout";
        }

        // Mark root-level items for later.
        if (actualItem.parentId === pmcData.Inventory.equipment)
        {
            actualItem.slotId = "hideout";
        }

        // Clear the location attribute of the item in the container.
        if (actualItem.slotId === "hideout" && "location" in actualItem)
        {
            delete actualItem.location;
        }

        // Remove found in raid
        if ("upd" in actualItem && "SpawnedInSession" in actualItem.upd)
        {
            actualItem.upd.SpawnedInSession = false;
        }

        // Mark to add to insurance
        this.insured[sessionID] = this.insured[sessionID] || {};
        this.insured[sessionID][insuredItem.tid] = this.insured[sessionID][insuredItem.tid] || [];
        this.insured[sessionID][insuredItem.tid].push(actualItem);

        pmcData.InsuredItems = pmcData.InsuredItems.filter((item) =>
        {
            return item.itemId !== insuredItem.itemId;
        });
    }

    /* store lost pmc gear */
    storeLostGear(pmcData, offraidData, preRaidGear, sessionID)
    {
        const preRaidGearHash = {};
        const offRaidGearHash = {};
        let gears = [];

        // Build a hash table to reduce loops
        for (const item of preRaidGear)
        {
            preRaidGearHash[item._id] = item;
        }

        // Build a hash of offRaidGear
        for (const item of offraidData.profile.Inventory.items)
        {
            offRaidGearHash[item._id] = item;
        }

        for (let insuredItem of pmcData.InsuredItems)
        {
            if (preRaidGearHash[insuredItem.itemId])
            {
                // This item exists in preRaidGear, meaning we brought it into the raid...
                // Check if we brought it out of the raid
                if (!offRaidGearHash[insuredItem.itemId])
                {
                    // We didn't bring this item out! We must've lost it.
                    gears.push({
                        "pmcData": pmcData,
                        "insuredItem": insuredItem,
                        "item": preRaidGearHash[insuredItem.itemId],
                        "sessionID": sessionID
                    });
                }
            }
        }

        for (let gear of gears)
        {
            this.addGearToSend(gear.pmcData, gear.insuredItem, gear.item, gear.sessionID);
        }
    }

    /* store insured items on pmc death */
    storeDeadGear(pmcData, offraidData, preRaidGear, sessionID)
    {
        const preRaidGearHash = {};
        const securedContainerItemHash = {};
        const pmcItemsHash = {};

        let gears = [];
        let securedContainerItems = InventoryHelper.getSecureContainer(offraidData.profile.Inventory.items);

        for (const item of preRaidGear)
        {
            preRaidGearHash[item._id] = item;
        }

        for (const item of securedContainerItems)
        {
            securedContainerItemHash[item._id] = item;
        }

        for (const item of pmcData.Inventory.items)
        {
            pmcItemsHash[item._id] = item;
        }

        for (let insuredItem of pmcData.InsuredItems)
        {
            if (preRaidGearHash[insuredItem.itemId]
            && !(securedContainerItemHash[insuredItem.itemId])
            && !(typeof pmcItemsHash[insuredItem.itemId] === "undefined")
            && !(pmcItemsHash[insuredItem.itemId].slotId === "SecuredContainer"))
            {
                gears.push({ "pmcData": pmcData, "insuredItem": insuredItem, "item": pmcItemsHash[insuredItem.itemId], "sessionID": sessionID });
            }
        }

        for (let gear of gears)
        {
            this.addGearToSend(gear.pmcData, gear.insuredItem, gear.item, gear.sessionID);
        }
    }

    /* sends stored insured items as message */
    sendInsuredItems(pmcData, sessionID)
    {
        for (let traderId in this.insured[sessionID])
        {
            let trader = trader_f.controller.getTrader(traderId, sessionID);
            let time = TimeUtil.getTimestamp() + RandomUtil.getInt(trader.insurance.min_return_hour * 3600, trader.insurance.max_return_hour * 3600);
            let dialogueTemplates = database_f.server.tables.traders[traderId].dialogue;
            let messageContent = {
                "templateId": RandomUtil.getArrayValue(dialogueTemplates.insuranceStart),
                "type": dialogue_f.controller.getMessageTypeValue("npcTrader")
            };

            dialogue_f.controller.addDialogueMessage(traderId, messageContent, sessionID);

            messageContent = {
                "templateId": RandomUtil.getArrayValue(dialogueTemplates.insuranceFound),
                "type": dialogue_f.controller.getMessageTypeValue("insuranceReturn"),
                "maxStorageTime": trader.insurance.max_storage_time * 3600,
                "systemData": {
                    "date": TimeUtil.getDate(),
                    "time": TimeUtil.getTime(),
                    "location": pmcData.Info.EntryPoint
                }
            };

            for (let insuredItem of this.insured[sessionID][traderId])
            {
                const isParentHere = this.insured[sessionID][traderId].find(isParent => isParent._id === insuredItem.parentId);
                if (!isParentHere)
                {
                    insuredItem.slotId = "hideout";
                    delete insuredItem.location;
                }
            }

            save_f.server.profiles[sessionID].insurance.push({
                "scheduledTime": time,
                "traderId": traderId,
                "messageContent": messageContent,
                "items": this.insured[sessionID][traderId]
            });
        }

        this.resetInsurance(sessionID);
    }

    processReturn()
    {
        const time = TimeUtil.getTimestamp();

        for (const sessionID in save_f.server.profiles)
        {
            let insurance = save_f.server.profiles[sessionID].insurance;
            let i = insurance.length;

            while (i-- > 0)
            {
                let insured = insurance[i];

                if (time < insured.scheduledTime)
                {
                    continue;
                }
                // Inject a little bit of a surprise by failing the insurance from time to time ;)
                let toLook = [
                    "hideout",
                    "main",
                    "mod_scope",
                    "mod_magazine",
                    "mod_sight_rear",
                    "mod_sight_front",
                    "mod_tactical",
                    "mod_muzzle",
                    "mod_tactical_2",
                    "mod_foregrip",
                    "mod_tactical_000",
                    "mod_tactical_001",
                    "mod_tactical_002",
                    "mod_tactical_003",
                    "mod_nvg"
                ];
                let toDelete = [];

                for (let insuredItem of insured.items)
                {
                    if ((toLook.includes(insuredItem.slotId) || !isNaN(insuredItem.slotId)) && RandomUtil.getInt(0, 99) >= insurance_f.config.returnChance && !toDelete.includes(insuredItem._id))
                    {
                        toDelete.push.apply(toDelete, ItemHelper.findAndReturnChildrenByItems(insured.items, insuredItem._id));
                    }
                }

                for (let pos = insured.items.length - 1; pos >= 0; --pos)
                {
                    if (toDelete.includes(insured.items[pos]._id))
                    {
                        insured.items.splice(pos, 1);
                    }
                }

                if (insured.items.length === 0)
                {
                    const insuranceFailedTemplates = database_f.server.tables.traders[insured.traderId].dialogue.insuranceFailed;
                    insured.messageContent.templateId = RandomUtil.getArrayValue(insuranceFailedTemplates);
                }

                dialogue_f.controller.addDialogueMessage(insured.traderId, insured.messageContent, sessionID, insured.items);
                insurance.splice(i, 1);
            }

            save_f.server.profiles[sessionID].insurance = insurance;
        }
    }

    /* add insurance to an item */
    insure(pmcData, body, sessionID)
    {
        let itemsToPay = [];
        let inventoryItemsHash = {};

        for (const item of pmcData.Inventory.items)
        {
            inventoryItemsHash[item._id] = item;
        }

        // get the price of all items
        for (let key of body.items)
        {
            itemsToPay.push({
                "id": inventoryItemsHash[key]._id,
                "count": Math.round(this.getPremium(pmcData, inventoryItemsHash[key], body.tid))
            });
        }

        // pay the item	to profile
        if (!Helpers.payMoney(pmcData, { "scheme_items": itemsToPay, "tid": body.tid }, sessionID))
        {
            Logger.error("no money found");
            return "";
        }

        // add items to InsuredItems list once money has been paid
        for (let key of body.items)
        {
            pmcData.InsuredItems.push({
                "tid": body.tid,
                "itemId": inventoryItemsHash[key]._id
            });
        }

        return item_f.eventHandler.getOutput();
    }

    generateTemplatesById()
    {
        if (Object.keys(this.templatesById).length === 0)
        {
            for (const item of database_f.server.tables.templates.handbook.Items)
            {
                this.templatesById[item.Id] = item;
            }
        }
    }

    // TODO: Move to helper functions
    getItemPrice(_tpl)
    {
        let price = 0;

        if (this.templatesById[_tpl] !== undefined)
        {
            let template = this.templatesById[_tpl];
            price = template.Price;
        }
        else
        {
            let item = database_f.server.tables.templates.items[_tpl];
            price = item._props.CreditsPrice;
        }

        return price;
    }

    getPremium(pmcData, inventoryItem, traderId)
    {
        let premium = this.getItemPrice(inventoryItem._tpl) * insurance_f.config.priceMultiplier;
        premium -= premium * (pmcData.TraderStandings[traderId].currentStanding > 0.5 ? 0.5 : pmcData.TraderStandings[traderId].currentStanding);
        return Math.round(premium);
    }

    /* calculates insurance cost */
    cost(info, sessionID)
    {
        let output = {};
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let inventoryItemsHash = {};

        for (const item of pmcData.Inventory.items)
        {
            inventoryItemsHash[item._id] = item;
        }

        for (let trader of info.traders)
        {
            let items = {};

            for (let key of info.items)
            {
                items[inventoryItemsHash[key]._tpl] = Math.round(this.getPremium(pmcData, inventoryItemsHash[key], trader));
            }

            output[trader] = items;
        }

        return output;
    }
}

module.exports = new InsuranceController();
