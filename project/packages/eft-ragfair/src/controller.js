/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Emperor06
 * - Terkoiz
 */

"use strict";

class Controller
{
    initialize()
    {
        // initialize base offer expire date (1 week after server start)
        const time = common_f.time.getTimestamp();

        database_f.server.tables.ragfair.offer.startTime = time;
        database_f.server.tables.ragfair.offer.endTime = time + 604800000;

        // get all trader offers
        database_f.server.tables.ragfair.offers = {
            "categories": {},
            "offers": [],
            "offersCount": 100,
            "selectedCategory": "5b5f78dc86f77409407a7f8e"
        };

        for (const traderID in database_f.server.tables.traders)
        {
            this.addTraderAssort(traderID);
        }
    }

    addTraderAssort(traderID)
    {
        let base = database_f.server.tables.ragfair.offers;

        // skip ragfair and fence trader
        if (traderID === "ragfair" || traderID === "579dc571d53a0658a154fbec")
        {
            return;
        }

        const assort = database_f.server.tables.traders[traderID].assort;

        for (const item of assort.items)
        {
            if (item.slotId !== "hideout")
            {
                // only use base items
                continue;
            }

            // items
            let items = [];

            items.push(item);
            items = [...items, ...helpfunc_f.helpFunctions.findAndReturnChildrenByAssort(item._id, assort.items)];

            // barter scheme
            let barter_scheme = null;

            for (const barter in assort.barter_scheme)
            {
                if (item._id === barter)
                {
                    barter_scheme = assort.barter_scheme[barter][0];
                    break;
                }
            }

            // loyal level
            let loyal_level = 0;

            for (const loyalLevel in assort.loyal_level_items)
            {
                if (item._id === loyalLevel)
                {
                    loyal_level = assort.loyal_level_items[loyalLevel];
                    break;
                }
            }

            // add the offer
            base.offers = base.offers.concat(this.createTraderOffer(items, barter_scheme, loyal_level, traderID));
        }

        database_f.server.tables.ragfair.offers = base;
    }

    createTraderOffer(itemsToSell, barter_scheme, loyal_level, traderID, counter = 911)
    {
        const trader = database_f.server.tables.traders[traderID].base;
        let offerBase = common_f.json.clone(database_f.server.tables.ragfair.offer);

        offerBase._id = itemsToSell[0]._id;
        offerBase.intId = counter;
        offerBase.user = {
            "id": trader._id,
            "memberType": 4,
            "nickname": trader.surname,
            "rating": 1,
            "isRatingGrowing": true,
            "avatar": trader.avatar
        };
        offerBase.root = itemsToSell[0]._id;
        offerBase.items = itemsToSell;
        offerBase.requirements = barter_scheme;
        offerBase.loyaltyLevel = loyal_level;

        return [offerBase];
    }

    createOffer(template, onlyFunc, usePresets = true)
    {
        // Some slot filters reference bad items
        if (!(template in database_f.server.tables.templates.items))
        {
            common_f.logger.logWarning("Item " + template + " does not exist");
            return [];
        }

        let offerBase = common_f.json.clone(database_f.server.tables.ragfair.offer);
        let offers = [];

        // Preset
        if (usePresets && preset_f.controller.hasPreset(template))
        {
            let presets = common_f.json.clone(preset_f.controller.getPresets(template));

            for (let p of presets)
            {
                let offer = common_f.json.clone(offerBase);
                let mods = p._items;
                let rub = 0;

                for (let it of mods)
                {
                    rub += helpfunc_f.helpFunctions.getTemplatePrice(it._tpl);
                }

                mods[0].upd = mods[0].upd || {}; // append the stack count
                mods[0].upd.StackObjectsCount = offerBase.items[0].upd.StackObjectsCount;

                offer._id = p._id;               // The offer's id is now the preset's id
                offer.root = mods[0]._id;        // Sets the main part of the weapon
                offer.items = mods;
                offer.requirements[0].count = Math.round(rub * ragfair_f.config.priceMultiplier);
                offers.push(offer);
            }
        }

        // Single item
        if (!preset_f.controller.hasPreset(template) || !onlyFunc)
        {
            let rubPrice = Math.round(helpfunc_f.helpFunctions.getTemplatePrice(template) * ragfair_f.config.priceMultiplier);
            offerBase._id = template;
            offerBase.items[0]._tpl = template;
            offerBase.requirements[0].count = rubPrice;
            offerBase.itemsCost = rubPrice;
            offerBase.requirementsCost = rubPrice;
            offerBase.summaryCost = rubPrice;
            offers.push(offerBase);
        }

        return offers;
    }

    sortOffersByID(a, b)
    {
        return a.intId - b.intId;
    }

    sortOffersByRating(a, b)
    {
        return a.user.rating - b.user.rating;
    }

    sortOffersByName(a, b)
    {
        // @TODO: Get localized item names
        try
        {
            let aa = helpfunc_f.helpFunctions.getItem(a._id)[1]._name;
            let bb = helpfunc_f.helpFunctions.getItem(b._id)[1]._name;

            aa = aa.substring(aa.indexOf("_") + 1);
            bb = bb.substring(bb.indexOf("_") + 1);

            return aa.localeCompare(bb);
        }
        catch (e)
        {
            return 0;
        }
    }

    sortOffersByPrice(a, b)
    {
        return a.requirements[0].count - b.requirements[0].count;
    }

    sortOffersByPriceSummaryCost(a, b)
    {
        return a.summaryCost - b.summaryCost;
    }

    sortOffersByExpiry(a, b)
    {
        return a.endTime - b.endTime;
    }

    sortOffers(request, offers)
    {
        // Sort results
        switch (request.sortType)
        {
            case 0: // ID
                offers.sort(this.sortOffersByID);
                break;

            case 3: // Merchant (rating)
                offers.sort(this.sortOffersByRating);
                break;

            case 4: // Offer (title)
                offers.sort(this.sortOffersByName);
                break;

            case 5: // Price
                if (request.offerOwnerType === 1)
                {
                    offers.sort(this.sortOffersByPriceSummaryCost);
                }
                else
                {
                    offers.sort(this.sortOffersByPrice);
                }

                break;

            case 6: // Expires in
                offers.sort(this.sortOffersByExpiry);
                break;
        }

        // 0=ASC 1=DESC
        if (request.sortDirection === 1)
        {
            offers.reverse();
        }

        return offers;
    }

    getOffers(sessionID, request)
    {
        //if its traders items, just a placeholder it will be handled differently later
        if (request.offerOwnerType ===  1)
        {
            return this.getOffersFromTraders(sessionID, request);
        }

        // Player's own offers
        if (request.offerOwnerType === 2)
        {
            const offers = save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers;
            const categories = {};
            for (let offer of offers)
            {
                categories[offer.items[0]._tpl] = 1;
            }
            return https_f.response.getBody({
                "offers": offers,
                "categories": categories
            });
        }

        let response = {"categories": {}, "offers": [], "offersCount": 10, "selectedCategory": "5b5f78dc86f77409407a7f8e"};
        let itemsToAdd = [];
        let offers = [];

        if (!request.linkedSearchId && !request.neededSearchId)
        {
            response.categories = (trader_f.controller.getAssort(sessionID, "ragfair")).loyal_level_items;
        }

        if (request.buildCount)
        {
            // Case: weapon builds
            itemsToAdd = itemsToAdd.concat(Object.keys(request.buildItems));
        }
        else
        {
            // Case: search
            if (request.linkedSearchId)
            {
                itemsToAdd = this.getLinkedSearchList(request.linkedSearchId);
            }
            else if (request.neededSearchId)
            {
                itemsToAdd = this.getNeededSearchList(request.neededSearchId);
            }

            // Case: category
            if (request.handbookId)
            {
                let handbook = this.getCategoryList(request.handbookId);

                if (itemsToAdd.length)
                {
                    itemsToAdd = helpfunc_f.helpFunctions.arrayIntersect(itemsToAdd, handbook);
                }
                else
                {
                    itemsToAdd = handbook;
                }
            }
        }

        for (let item of itemsToAdd)
        {
            offers = offers.concat(this.createOffer(item, request.onlyFunctional, request.buildCount === 0));
        }

        // merge trader offers with player offers display offers is set to 'ALL'
        if (request.offerOwnerType === 0)
        {
            const traderOffers = this.getOffersFromTraders(sessionID, request).offers;

            offers = [...offers, ...traderOffers];
        }

        response.offers = this.sortOffers(request, offers);
        this.countCategories(response);
        return response;
    }

    getOffersFromTraders(sessionID, request)
    {
        let jsonToReturn = common_f.json.clone(database_f.server.tables.ragfair.offers);
        let offersFilters = []; //this is an array of item tpl who filter only items to show

        jsonToReturn.categories = {};

        for (let offerC of jsonToReturn.offers)
        {
            jsonToReturn.categories[offerC.items[0]._tpl] = 1;
        }

        if (request.buildCount)
        {
            // Case: weapon builds
            offersFilters = Object.keys(request.buildItems) ;
            jsonToReturn = this.fillCatagories(jsonToReturn, offersFilters);
        }
        else
        {
            // Case: search
            if (request.linkedSearchId)
            {
                offersFilters = [...offersFilters, ...this.getLinkedSearchList(request.linkedSearchId) ];
                jsonToReturn = this.fillCatagories(jsonToReturn, offersFilters);
            }
            else if (request.neededSearchId)
            {
                offersFilters = [...offersFilters, ...this.getNeededSearchList(request.neededSearchId) ];
                jsonToReturn = this.fillCatagories(jsonToReturn, offersFilters);
            }

            if (request.removeBartering === true)
            {
                jsonToReturn = this.removeBarterOffers(jsonToReturn);
                jsonToReturn = this.fillCatagories(jsonToReturn, offersFilters);
            }

            // Case: category
            if (request.handbookId)
            {
                let handbookList = this.getCategoryList(request.handbookId);

                if (offersFilters.length)
                {
                    offersFilters = helpfunc_f.helpFunctions.arrayIntersect(offersFilters, handbookList);
                }
                else
                {
                    offersFilters = handbookList;
                }
            }
        }

        let offersToKeep = [];

        for (let offer in jsonToReturn.offers)
        {
            for (let tplTokeep of offersFilters)
            {
                if (jsonToReturn.offers[offer].items[0]._tpl === tplTokeep)
                {
                    jsonToReturn.offers[offer].summaryCost = this.calculateCost(jsonToReturn.offers[offer].requirements);

                    // check if offer is really available, removes any quest locked items not in current assort of a trader
                    let tmpOffer = jsonToReturn.offers[offer];
                    let traderId = tmpOffer.user.id;
                    let items = trader_f.controller.getAssort(sessionID, traderId).items;

                    for (let item of items)
                    {
                        if (item._id === tmpOffer.root)
                        {
                            offersToKeep.push(jsonToReturn.offers[offer]);
                            break;
                        }
                    }
                }
            }
        }

        jsonToReturn.offers = offersToKeep;
        jsonToReturn.offers = this.sortOffers(request, jsonToReturn.offers);

        return jsonToReturn;
    }

    calculateCost(barter_scheme)//theorical , not tested not implemented
    {
        let summaryCost = 0;

        for (let barter of barter_scheme)
        {
            summaryCost += helpfunc_f.helpFunctions.getTemplatePrice(barter._tpl) * barter.count;
        }

        return Math.round(summaryCost);
    }

    fillCatagories(response, filters)
    {
        response.categories = {};

        for (let filter of filters)
        {
            response.categories[filter] = 1;
        }

        return response;
    }

    getCategoryList(handbookId)
    {
        let result = [];

        // if its "mods" great-parent category, do double recursive loop
        if (handbookId === "5b5f71a686f77447ed5636ab")
        {
            for (let categ2 of helpfunc_f.helpFunctions.childrenCategories(handbookId))
            {
                for (let categ3 of helpfunc_f.helpFunctions.childrenCategories(categ2))
                {
                    result = result.concat(helpfunc_f.helpFunctions.templatesWithParent(categ3));
                }
            }
        }
        else
        {
            if (helpfunc_f.helpFunctions.isCategory(handbookId))
            {
                // list all item of the category
                result = result.concat(helpfunc_f.helpFunctions.templatesWithParent(handbookId));

                for (let categ of helpfunc_f.helpFunctions.childrenCategories(handbookId))
                {
                    result = result.concat(helpfunc_f.helpFunctions.templatesWithParent(categ));
                }
            }
            else
            {
                // its a specific item searched then
                result.push(handbookId);
            }
        }

        return result;
    }

    removeBarterOffers(response)
    {
        let override = [];

        for (const offer of response.offers)
        {
            if (helpfunc_f.helpFunctions.isMoneyTpl(offer.requirements[0]._tpl) === true)
            {
                override.push(offer);
            }
        }

        response.offers = override;
        return response;
    }

    getNeededSearchList(neededSearchId)
    {
        let result = [];

        for (let item of Object.values(database_f.server.tables.templates.items))
        {
            if (this.isInFilter(neededSearchId, item, "Slots")
            || this.isInFilter(neededSearchId, item, "Chambers")
            || this.isInFilter(neededSearchId, item, "Cartridges"))
            {
                result.push(item._id);
            }
        }

        return result;
    }

    getLinkedSearchList(linkedSearchId)
    {
        let item = database_f.server.tables.templates.items[linkedSearchId];

        // merging all possible filters without duplicates
        let result = new Set([
            ...this.getFilters(item, "Slots"),
            ...this.getFilters(item, "Chambers"),
            ...this.getFilters(item, "Cartridges")
        ]);

        return Array.from(result);
    }

    /* Because of presets, categories are not always 1 */
    countCategories(response)
    {
        let categ = {};

        for (let offer of response.offers)
        {
            let item = offer.items[0]; // only the first item can have presets

            categ[item._tpl] = categ[item._tpl] || 0;
            categ[item._tpl]++;
        }

        // not in search mode, add back non-weapon items
        for (let c in response.categories)
        {
            if (!categ[c])
            {
                categ[c] = 1;
            }
        }

        response.categories = categ;
    }

    /* Like getFilters but breaks early and return true if id is found in filters */
    isInFilter(id, item, slot)
    {
        if (slot in item._props && item._props[slot].length)
        {
            for (let sub of item._props[slot])
            {
                if ("_props" in sub && "filters" in sub._props)
                {
                    for (let filter of sub._props.filters)
                    {
                        if (filter.Filter.includes(id))
                        {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /* Scans a given slot type for filters and returns them as a Set */
    getFilters(item, slot)
    {
        let result = new Set();
        if (slot in item._props && item._props[slot].length)
        {
            for (let sub of item._props[slot])
            {
                if ("_props" in sub && "filters" in sub._props)
                {
                    for (let filter of sub._props.filters)
                    {
                        for (let f of filter.Filter)
                        {
                            result.add(f);
                        }
                    }
                }
            }
        }

        return result;
    }

    processOffers(sessionID)
    {
        const profileOffers = save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers;
        if (!profileOffers || !profileOffers.length)
        {
            return;
        }

        for (const offer of profileOffers)
        {
            if (offer.sellTime < common_f.time.getTimestamp())
            {
                this.completeOffer(sessionID, offer.requirements[0]._tpl, offer.summaryCost, offer.items);
                profileOffers.splice(profileOffers.findIndex(x => x._id === offer.id), 1);
            }

            if (offer.endTime < common_f.time.getTimestamp())
            {
                this.removeOffer(offer._id, sessionID);
            }
        }

        // TODO: On successful sale, increase rating by expected amount (taken from wiki?)
    }

    getItemPrice(request)
    {
        const price = Math.round(helpfunc_f.helpFunctions.getTemplatePrice(request.templateId) * ragfair_f.config.priceMultiplier);

        // 1 is returned by helper method if price lookup failed
        if (!price || price === 1)
        {
            common_f.logger.logError(`Could not fetch price for ${request.templateId}`);
        }

        return { avg: price, min: 0, max: 0 };
    }

    addOffer(pmcData, request, sessionID)
    {
        const response = item_f.eventHandler.getOutput();

        if (!request || !request.items || request.items.length === 0)
        {
            common_f.logger.logError("Invalid addOffer request");
            return helpfunc_f.helpFunctions.appendErrorToOutput(response);
        }

        if (!request.requirements || request.requirements.length !== 1)
        {
            // TODO: rework code to support multiple requirements
            return helpfunc_f.helpFunctions.appendErrorToOutput(response, "You can only have one requirement");
        }

        const requestedItemTpl = request.requirements[0]._tpl;
        if (!helpfunc_f.helpFunctions.isMoneyTpl(requestedItemTpl))
        {
            // TODO: rework code to support barter offers
            return helpfunc_f.helpFunctions.appendErrorToOutput(response, "You can only request money");
        }

        // Count how many items are being sold and multiply the requested amount accordingly
        let moneyAmount = 0;
        let itemStackCount = 0;
        if (request.sellInOnePiece)
        {
            moneyAmount = request.requirements[0].count;
        }
        else
        {
            for (const itemId of request.items)
            {
                const item = pmcData.Inventory.items.find(i => i._id === itemId);
                if (!item)
                {
                    common_f.logger.logError(`Failed to find item with _id: ${itemId} in inventory!`);
                    return helpfunc_f.helpFunctions.appendErrorToOutput(response);
                }

                if (!("upd" in item) || !("StackObjectsCount" in item.upd))
                {
                    itemStackCount += 1;
                }
                else
                {
                    itemStackCount += item.upd.StackObjectsCount;
                }
            }
            moneyAmount = request.requirements[0].count * itemStackCount;
        }

        let invItems = [];
        for (const item in request.items)
        {
            invItems = [invItems, ...helpfunc_f.helpFunctions.findAndReturnChildrenAsItems(pmcData.Inventory.items, item)];
        }

        if (!invItems || !invItems.length)
        {
            common_f.logger.logError("Could not find any requested items in the inventory");
            return helpfunc_f.helpFunctions.appendErrorToOutput(response);
        }

        let basePrice = 0;
        for (const item of invItems)
        {
            const mult = ("upd" in item) && ("StackObjectsCount" in item.upd) ? item.upd.StackObjectsCount : 1;
            basePrice += Math.round(helpfunc_f.helpFunctions.getTemplatePrice(item._tpl) * ragfair_f.config.priceMultiplier) * mult;
        }

        const basePricePercentage = (moneyAmount / basePrice) * 100;

        // Skip offer generation and insta-sell offer if price is being undercut by amount defined in settingsca
        if (basePricePercentage <= ragfair_f.config.instantSellThreshold)
        {
            this.completeOffer(sessionID, request.requirements[0]._tpl, moneyAmount, invItems);
            return response;
        }

        // Validation and preparations are done, create the offer
        // TODO: Random generate sale time based on offer pricing
        const offer = this.generateOffer(save_f.server.profiles[sessionID], request.requirements, invItems, request.sellInOnePiece, moneyAmount, common_f.time.getTimestamp() + 60);
        save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers.push(offer);
        response.ragFairOffers.push(offer);

        // Remove items from inventory after creating offer
        for (const itemToRemove of request.items)
        {
            // TODO: Reenable this once testing is done
            //inventory_f.controller.removeItem(pmcData, itemToRemove, response, sessionID);
        }

        return response;
    }

    removeOffer(offerId, sessionID)
    {
        // TODO: Upon cancellation (or expiry), take away expected amount of flea rating
        const offers = save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers;

        const index = offers.findIndex(offer => offer._id === offerId);
        if (index === -1)
        {
            common_f.logger.logWarning(`Could not find offer to remove with offerId -> ${offerId}`);
            return item_f.eventHandler.getOutput();
        }

        const itemsToReturn = common_f.json.clone(offers[index].items);
        this.returnItems(sessionID, itemsToReturn);

        offers.splice(index, 1);

        return item_f.eventHandler.getOutput();
    }

    extendOffer(offerId, sessionID)
    {
        // TODO: Subtract money and change offer endTime
        return item_f.eventHandler.getOutput();
    }

    completeOffer(sessionID, currencyTpl, moneyAmount, items)
    {
        const formatCurrency = (moneyAmount) => moneyAmount.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
        const getCurrencySymbol = (currencyTpl) =>
        {
            switch (currencyTpl)
            {
                case "569668774bdc2da2298b4568":
                    return "€";
                case "5696686a4bdc2da3298b456a":
                    return "$";
                case "5449016a4bdc2d6f028b456f":
                default:
                    return "₽";
            }
        };

        const itemTpl = items[0]._tpl;

        let itemCount = 0;
        for (const item of items)
        {
            if (!("upd" in item) || !("StackObjectsCount" in item.upd))
            {
                itemCount += 1;
            }
            else
            {
                itemCount += item.upd.StackObjectsCount;
            }
        }

        // Create an item of the specified currency
        const moneyItem = {
            "_id": common_f.hash.generate(),
            "_tpl": currencyTpl,
            "upd": { "StackObjectsCount": moneyAmount }
        };

        // Split the money stacks in case more than the stack limit is requested
        const itemsToSend = helpfunc_f.helpFunctions.splitStack(moneyItem);

        // Generate a message to inform that item was sold
        const findItemResult = helpfunc_f.helpFunctions.getItem(itemTpl);
        let messageText = "Your offer was sold";
        if (findItemResult[0])
        {
            try
            {
                const itemLocale = database_f.server.tables.locales.global["en"].templates[findItemResult[1]._id];
                if (itemLocale && itemLocale.Name)
                {
                    messageText = `Your ${itemLocale.Name} (x${itemCount}) was bought by ${this.fetchRandomPmcName()} for ${getCurrencySymbol(currencyTpl)}${formatCurrency(moneyAmount)}`;
                }
            }
            catch (err)
            {
                common_f.logger.logError(`Could not get locale data for item with _id -> ${findItemResult[1]._id}`);
            }
        }

        const messageContent = {
            "text": messageText.replace(/"/g, ""),
            "type": 4, // EMessageType.FleamarketMessage
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage("5ac3b934156ae10c4430e83c", messageContent, sessionID, itemsToSend);
    }

    returnItems(sessionID, items)
    {
        const messageContent = {
            "text": "Your offer was cancelled",
            "type": 13,
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage("5ac3b934156ae10c4430e83c", messageContent, sessionID, items);
    }

    generateOffer(profile, requirements, items, sellInOnePiece, amountToSend, sellTime)
    {
        return {
            "_id": common_f.hash.generate(),
            "user": this.generateOfferOwner(profile),
            "items": items.forEach(item => delete item.location),
            "root": items[0]._id,
            "requirements": requirements,
            "sellInOnePiece": sellInOnePiece,
            "startTime": common_f.time.getTimestamp(),
            "endTime": common_f.time.getTimestamp() + (12 * 60 * 60),
            "sellTime": sellTime, // Custom field, not used in-game. Only saved server-side
            "summaryCost": amountToSend,
            "requirementsCost": amountToSend,
            "loyaltyLevel": 1
        };
    }

    generateOfferOwner(profile)
    {
        return {
            "id": profile.characters.pmc._id,
            "nickname": profile.characters.pmc.Info.Nickname,
            "rating": profile.characters.pmc.RagfairInfo.rating,
            "memberType": profile.characters.pmc.Info.AccountType,
            "isRatingGrowing": profile.characters.pmc.RagfairInfo.isRatingGrowing
        };
    }

    formatRequirementsForOffer(requirements)
    {
        const toReturn = [];
        for (const item in requirements)
        {
            toReturn.push({
                "_tpl": item._tpl,
                "count": item.count,
                "onlyFunctional": item.onlyFunctional
            });
        }
    }

    fetchRandomPmcName()
    {
        const type = common_f.random.getInt(0, 1) === 0 ? "usec" : "bear";
        try
        {
            return common_f.random.getArrayValue(database_f.server.tables.bots.types[type].names);
        }
        catch (err)
        {
            common_f.logger.logError(`Failed to fetch a random PMC name for type -> ${type}`);
            common_f.logger.logInfo(common_f.json.serialize(err));
            return "Anonymous";
        }
    }
}

module.exports.Controller = Controller;
