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

class Controller
{
    constructor()
    {
        event_f.controller.addEvent("insuranceReturn", this.processReturn.bind(this));
    }

    resetInsurance(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        profile.insurance = {};
        return profile;
    }

    onSave(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        if ("insurance" in profile)
        {
            delete profile.insurance;
        }

        return profile;
    }

    checkExpiredInsurance(sessionID)
    {
        let events = save_f.server.profiles[sessionID].events;
        let now = Date.now();

        for (let count = events.length - 1; count >= 0; count--)
        {
            let event = events[count];

            if (event.type === "insuranceReturn" && event.scheduledTime <= now)
            {
                event_f.controller.processEvent(event);
                events.splice(count, 1);
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
        save_f.server.profiles[sessionID].insurance = save_f.server.profiles[sessionID].insurance || {};
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

        save_f.server.profiles[sessionID].insurance[insuredItem.tid] = save_f.server.profiles[sessionID].insurance[insuredItem.tid] || [];
        save_f.server.profiles[sessionID].insurance[insuredItem.tid].push(actualItem);
        for (let insurance in pmcData.InsuredItems)
        {
            if (pmcData.InsuredItems[insurance].itemId === insuredItem.itemId)
            {
                pmcData.InsuredItems.splice(insurance, 1);
            }
        }
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
        const preRaidGearHash = {};
        const securedContainerItemHash = {};
        const pmcItemsHash = {};

        let gears = [];
        let securedContainerItems = helpfunc_f.helpFunctions.getSecureContainer(offraidData.profile.Inventory.items);

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
        for (let traderId in save_f.server.profiles[sessionID].insurance)
        {
            let trader = trader_f.controller.getTrader(traderId, sessionID);
            let dialogueTemplates = database_f.database.tables.traders[traderId].dialogue;
            let messageContent = {
                "templateId": dialogueTemplates.insuranceStart[utility.getRandomInt(0, dialogueTemplates.insuranceStart.length - 1)],
                "type": dialogue_f.controller.getMessageTypeValue("npcTrader")
            };

            dialogue_f.controller.addDialogueMessage(traderId, messageContent, sessionID);

            messageContent = {
                "templateId": dialogueTemplates.insuranceFound[utility.getRandomInt(0, dialogueTemplates.insuranceFound.length - 1)],
                "type": dialogue_f.controller.getMessageTypeValue("insuranceReturn"),
                "maxStorageTime": trader.insurance.max_storage_time * 3600,
                "systemData": {
                    "date": utility.getDate(),
                    "time": utility.getTime(),
                    "location": pmcData.Info.EntryPoint
                }
            };

            event_f.controller.addToSchedule(sessionID, {
                "type": "insuranceReturn",
                "scheduledTime": Date.now() + utility.getRandomInt(trader.insurance.min_return_hour * 3600, trader.insurance.max_return_hour * 3600) * 1000,
                "data": {
                    "traderId": traderId,
                    "messageContent": messageContent,
                    "items": save_f.server.profiles[sessionID].insurance[traderId]
                }
            });
        }

        this.resetInsurance(sessionID);
    }

    processReturn(event)
    {
        // Inject a little bit of a surprise by failing the insurance from time to time ;)
        if (utility.getRandomInt(0, 99) >= insurance_f.config.returnChance)
        {
            const insuranceFailedTemplates = database_f.database.tables.traders[event.data.traderId].dialogue.insuranceFailed;
            event.data.messageContent.templateId = insuranceFailedTemplates[utility.getRandomInt(0, insuranceFailedTemplates.length - 1)];
            event.data.items = [];
        }

        dialogue_f.controller.addDialogueMessage(event.data.traderId, event.data.messageContent, event.sessionId, event.data.items);
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

        return item_f.router.getOutput();
    }

    // TODO: Move to helper functions
    getItemPrice(_tpl)
    {
        let price = 0;

        if (typeof (global.templatesById) === "undefined")
        {
            global.templatesById = {};

            for (const item of database_f.database.tables.templates.handbook.Items)
            {
                templatesById[item.Id] = item;
            }
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
        let premium = this.getItemPrice(inventoryItem._tpl) * (insurance_f.config.priceMultiplier * 3);
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

class Callbacks
{
    constructor()
    {
        save_f.server.onLoadCallback["insurance"] = this.onLoad.bind();
        save_f.server.oncallbacks["insurance"] = this.onSave.bind();

        server_f.server.receiveCallback["INSURANCE"] = this.checkInsurance.bind();
        router_f.router.staticRoutes["/client/insurance/items/list/cost"] = this.getInsuranceCost.bind();
        item_f.router.addRoute("Insure", this.insure.bind());
    }

    onLoad(sessionID)
    {
        return insurance_f.controller.resetInsurance(sessionID);
    }

    onSave(sessionID)
    {
        return insurance_f.controller.onSave(sessionID);
    }

    checkInsurance(sessionID, req, resp, body, output)
    {
        if (req.url === "/client/notifier/channel/create")
        {
            insurance_f.controller.checkExpiredInsurance(sessionID);
        }
    }

    getInsuranceCost(url, info, sessionID)
    {
        return response_f.controller.getBody(insurance_f.controller.cost(info, sessionID));
    }

    insure(pmcData, body, sessionID)
    {
        return insurance_f.controller.insure(pmcData, body, sessionID);
    }
}

class Config
{
    constructor()
    {
        this.priceMultiplier = 1;
        this.returnChance = 75;
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
