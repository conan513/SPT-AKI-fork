/* insurance.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - Emperor06
 */

"use strict";

class InsuranceServer
{
    constructor()
    {
        events.scheduledEventHandler.addEvent("insuranceReturn", this.processReturn.bind(this));
    }

    resetInsurance(sessionID)
    {
        let profile = save_f.saveServer.profiles[sessionID];

        profile.insurance = {};
        return profile;
    }

    onSave(sessionID)
    {
        let profile = save_f.saveServer.profiles[sessionID];

        if ("insurance" in profile)
        {
            delete profile.insurance;
        }

        return profile;
    }

    checkExpiredInsurance()
    {
        let scheduledEvents = events.scheduledEventHandler.scheduledEvents;
        let now = Date.now();

        for (let count = scheduledEvents.length - 1; count >= 0; count--)
        {
            let event = scheduledEvents[count];

            if (event.type === "insuranceReturn" && event.scheduledTime <= now)
            {
                events.scheduledEventHandler.processEvent(event);
                scheduledEvents.splice(count, 1);
            }
        }
    }

    /* remove insurance from an item */
    remove(pmcData, body)
    {
        let toDo = [body];

        //Find the item and all of it's relates
        if (toDo[0] === undefined || toDo[0] === null || toDo[0] === "undefined")
        {
            logger.logError("item id is not valid");
            return;
        }

        let ids_toremove = helpfunc_f.helpFunctions.findAndReturnChildren(pmcData, toDo[0]); // get all ids related to this item, +including this item itself

        for (let i in ids_toremove)
        { // remove one by one all related items and itself
            for (let a in pmcData.Inventory.items)
            {	// find correct item by id and delete it
                if (pmcData.Inventory.items[a]._id === ids_toremove[i])
                {
                    for (let insurance in pmcData.InsuredItems)
                    {
                        if (pmcData.InsuredItems[insurance].itemId == ids_toremove[i])
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
        save_f.saveServer.profiles[sessionID] = this.resetInsurance(sessionID);
        // Don't process insurance for melee weapon or secure container.
        if (actualItem.slotId === "Scabbard" || actualItem.slotId === "SecuredContainer")
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

        // Clear the location attribute of the item in the container.
        if (actualItem.slotId === "hideout" && "location" in actualItem)
        {
            delete actualItem.location;
        }

        // Mark root-level items for later.
        if (actualItem.parentId === pmcData.Inventory.equipment)
        {
            actualItem.slotId = "hideout";
        }

        save_f.saveServer.profiles[sessionID].insurance[insuredItem.tid] = save_f.saveServer.profiles[sessionID].insurance[insuredItem.tid] || [];
        save_f.saveServer.profiles[sessionID].insurance[insuredItem.tid].push(actualItem);
        for (let insurance in pmcData.InsuredItems)
        {
            if (pmcData.InsuredItems[insurance].itemId == insuredItem.itemId)
            {
                pmcData.InsuredItems.splice(insurance, 1);
            }
        }
    }

    /* store lost pmc gear */
    storeLostGear(pmcData, offraidData, preRaidGear, sessionID)
    {
        // Build a hash table to reduce loops
        const preRaidGearHash = {};
        preRaidGear.forEach(i => preRaidGearHash[i._id] = i);

        // Build a hash of offRaidGear
        const offRaidGearHash = {};
        offraidData.profile.Inventory.items.forEach(i => offRaidGearHash[i._id] = i);

        let gears = [];

        for (let insuredItem of pmcData.InsuredItems)
        {
            if (preRaidGearHash[insuredItem.itemId])
            {
                // This item exists in preRaidGear, meaning we brought it into the raid...
                // Check if we brought it out of the raid
                if (!offRaidGearHash[insuredItem.itemId])
                {
                    // We didn't bring this item out! We must've lost it.
                    gears.push({ "pmcData": pmcData, "insuredItem": insuredItem, "item": preRaidGearHash[insuredItem.itemId], "sessionID": sessionID });
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
        let gears = [];
        let securedContainerItems = offraid_f.getSecuredContainer(offraidData.profile.Inventory.items);

        const preRaidGearHash = {};
        preRaidGear.forEach(i => preRaidGearHash[i._id] = i);

        const securedContainerItemHash = {};
        securedContainerItems.forEach(i => securedContainerItemHash[i._id] = i);

        const pmcItemsHash = {};
        pmcData.Inventory.items.forEach(i => pmcItemsHash[i._id] = i);

        for (let insuredItem of pmcData.InsuredItems)
        {
            if (preRaidGearHash[insuredItem.itemId] && !(securedContainerItemHash[insuredItem.itemId]) && !(typeof pmcItemsHash[insuredItem.itemId] === "undefined") && !(pmcItemsHash[insuredItem.itemId].slotId === "SecuredContainer"))
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
        for (let traderId in save_f.saveServer.profiles[sessionID].insurance)
        {
            let trader = trader_f.traderServer.getTrader(traderId, sessionID);
            let dialogueTemplates = database_f.database.tables.traders[traderId].dialogue;
            let messageContent = {
                "templateId": dialogueTemplates.insuranceStart[utility.getRandomInt(0, dialogueTemplates.insuranceStart.length - 1)],
                "type": dialogue_f.dialogueServer.getMessageTypeValue("npcTrader")
            };

            dialogue_f.dialogueServer.addDialogueMessage(traderId, messageContent, sessionID);

            messageContent = {
                "templateId": dialogueTemplates.insuranceFound[utility.getRandomInt(0, dialogueTemplates.insuranceFound.length - 1)],
                "type": dialogue_f.dialogueServer.getMessageTypeValue("insuranceReturn"),
                "maxStorageTime": trader.insurance.max_storage_time * 3600,
                "systemData": {
                    "date": utility.getDate(),
                    "time": utility.getTime(),
                    "location": pmcData.Info.EntryPoint
                }
            };

            events.scheduledEventHandler.addToSchedule({
                "type": "insuranceReturn",
                "sessionId": sessionID,
                "scheduledTime": Date.now() + utility.getRandomInt(trader.insurance.min_return_hour * 3600, trader.insurance.max_return_hour * 3600) * 1000,
                "data": {
                    "traderId": traderId,
                    "messageContent": messageContent,
                    "items": save_f.saveServer.profiles[sessionID].insurance[traderId]
                }
            });
        }

        this.resetInsurance(sessionID);
    }

    processReturn(event)
    {
        // Inject a little bit of a surprise by failing the insurance from time to time ;)
        if (utility.getRandomInt(0, 99) >= gameplayConfig.trading.insureReturnChance)
        {
            const insuranceFailedTemplates = database_f.database.tables.traders[event.data.traderId].dialogue.insuranceFailed;
            event.data.messageContent.templateId = insuranceFailedTemplates[utility.getRandomInt(0, insuranceFailedTemplates.length - 1)];
            event.data.items = [];
        }

        dialogue_f.dialogueServer.addDialogueMessage(event.data.traderId, event.data.messageContent, event.sessionId, event.data.items);
    }

    /* add insurance to an item */
    insure(pmcData, body, sessionID)
    {
        let itemsToPay = [];
        let inventoryItemsHash = {};
        pmcData.Inventory.items.forEach(i => inventoryItemsHash[i._id] = i);

        // get the price of all items
        for (let key of body.items)
        {
            itemsToPay.push({
                "id": inventoryItemsHash[key]._id,
                "count": Math.round(this.getPremium(pmcData, inventoryItemsHash[key], body.tid))
            });
        }

        // pay the item	to profile
        if (!helpfunc_f.helpFunctions.payMoney(pmcData, { "scheme_items": itemsToPay, "tid": body.tid }, sessionID))
        {
            logger.logError("no money found");
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

        return item_f.itemServer.getOutput();
    }

    // TODO: Move to helper functions
    getItemPrice(_tpl)
    {
        let price = 0;

        if (typeof (global.templatesById) === "undefined")
        {
            global.templatesById = {};
            database_f.database.tables.templates.handbook.Items.forEach(i => templatesById[i.Id] = i);
        }

        if (_tpl in templatesById)
        {
            let template = templatesById[_tpl];
            price = template.Price;
        }
        else
        {
            let item = database_f.database.tables.templates.items[_tpl];
            price = item._props.CreditsPrice;
        }

        return price;
    }

    getPremium(pmcData, inventoryItem, traderId)
    {
        let premium = this.getItemPrice(inventoryItem._tpl) * (gameplayConfig.trading.insureMultiplier * 3);
        premium -= premium * (pmcData.TraderStandings[traderId].currentStanding > 0.5 ? 0.5 : pmcData.TraderStandings[traderId].currentStanding);
        return Math.round(premium);
    }

    /* calculates insurance cost */
    cost(info, sessionID)
    {
        let output = {};
        let pmcData = profile_f.profileController.getPmcProfile(sessionID);

        let inventoryItemsHash = {};
        pmcData.Inventory.items.forEach(i => inventoryItemsHash[i._id] = i);

        for (let trader of info.traders)
        {
            let items = {};

            for (let key of info.items)
            {
                try
                {
                    items[inventoryItemsHash[key]._tpl] = Math.round(this.getPremium(pmcData, inventoryItemsHash[key], trader));
                }
                catch (e)
                {
                    logger.logError("Anomalies in the calculation of insurance prices");
                    logger.logError("InventoryItemId:" + key);
                    logger.logError("ItemId:" + inventoryItemsHash[key]._tpl);
                }
            }

            output[trader] = items;
        }

        return output;
    }
}

class InsuranceCallback
{
    constructor()
    {
        save_f.saveServer.onLoadCallback["insurance"] = this.onLoad.bind();
        save_f.saveServer.onSaveCallback["insurance"] = this.onSave.bind();

        server.addReceiveCallback("INSURANCE", this.checkInsurance.bind());
        router.addStaticRoute("/client/insurance/items/list/cost", this.getInsuranceCost.bind());
        item_f.itemServer.addRoute("Insure", this.insure.bind());
    }

    onLoad(sessionID)
    {
        return insurance_f.insuranceServer.resetInsurance(sessionID);
    }

    onSave(sessionID)
    {
        return insurance_f.insuranceServer.onSave(sessionID);
    }

    checkInsurance(sessionID, req, resp, body, output)
    {
        if (req.url === "/client/notifier/channel/create")
        {
            insurance_f.insuranceServer.checkExpiredInsurance();
        }
    }

    getInsuranceCost(url, info, sessionID)
    {
        return response_f.responseController.getBody(insurance_f.insuranceServer.cost(info, sessionID));
    }

    insure(pmcData, body, sessionID)
    {
        return insurance_f.insuranceServer.insure(pmcData, body, sessionID);
    }
}

module.exports.insuranceServer = new InsuranceServer();
module.exports.insuranceCallback = new InsuranceCallback();
