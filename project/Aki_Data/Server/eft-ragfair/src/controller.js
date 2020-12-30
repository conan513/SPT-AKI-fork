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
        this.TPL_GOODS_SOLD = "5bdac0b686f7743e1665e09e";
        this.TPL_GOODS_RETURNED = "5bdac06e86f774296f5a19c5";

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
            let rubPrice = this.fetchItemFleaPrice(template);
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
        // force player-only in weapon preset build purchase
        // 0.12.9.10423 has a bug where trader items are always forced
        if (request.buildCount)
        {
            request.offerOwnerType = 2;
        }

        //if its traders items, just a placeholder it will be handled differently later
        if (request.offerOwnerType === 1)
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
        const timestamp = common_f.time.getTimestamp();

        if (!profileOffers || !profileOffers.length)
        {
            return;
        }

        for (const [index, offer] of profileOffers.entries())
        {
            if (offer.endTime <= timestamp)
            {
                // item expired
                this.removeOffer(offer._id, sessionID);
            }
            else if (common_f.random.getInt(0, 99) < ragfair_f.config.sellChance)
            {
                // item sold
                this.completeOffer(sessionID, offer.requirements, offer.summaryCost, offer.items, offer._id);
                //  profileOffers.splice(index, 1);
            }
        }
    }

    getItemPrice(info)
    {
        const price = this.fetchItemFleaPrice(info.templateId);

        // 1 is returned by helper method if price lookup failed
        if (!price || price === 1)
        {
            common_f.logger.logError(`Could not fetch price for ${info.templateId}`);
        }

        return {
            "avg": price,
            "min": price,
            "max": price
        };
    }

    getItemPrices()
    {
        let result = {};

        for (const itemID in database_f.server.tables.templates.items)
        {
            if (database_f.server.tables.templates.items[itemID]._type !== "Node")
            {
                result[itemID] = this.fetchItemFleaPrice(itemID);
            }
        }

        return result;
    }

    addOffer(pmcData, info, sessionID)
    {
        const response = item_f.eventHandler.getOutput();

        if (!info || !info.items || info.items.length === 0)
        {
            common_f.logger.logError("Invalid addOffer request");
            return helpfunc_f.helpFunctions.appendErrorToOutput(response);
        }

        if (!info.requirements)
        {
            return helpfunc_f.helpFunctions.appendErrorToOutput(response, "How did you place the offer with no requirements?");
        }

        let requirementsPriceInRub = 0,
            requirementsPrice = 0;

        for (const item of info.requirements)
        {
            let requestedItemTpl = item._tpl;
            if (!helpfunc_f.helpFunctions.isMoneyTpl(requestedItemTpl))
            {
                // TODO: rework code to support barter offers
                return helpfunc_f.helpFunctions.appendErrorToOutput(response, "You can only request money");
            }
            requirementsPriceInRub += helpfunc_f.helpFunctions.inRUB(item.count, requestedItemTpl);
            requirementsPrice += item.count;
        }

        // Count how many items are being sold and multiply the requested amount accordingly
        let moneyAmount = 0;
        let itemStackCount = 0;

        if (info.sellInOnePiece)
        {
            itemStackCount = 1;
        }
        else
        {
            for (const itemId of info.items)
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
        }

        moneyAmount = requirementsPrice * itemStackCount;

        let invItems = [];

        for (const itemId of info.items)
        {
            invItems.push(...helpfunc_f.helpFunctions.findAndReturnChildrenAsItems(pmcData.Inventory.items, itemId));
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
            basePrice += this.fetchItemFleaPrice(item._tpl) * mult;
        }

        if (!basePrice)
        {
            // Don't want to accidentally divide by 0
            common_f.logger.logError("Failed to count base price for offer");
            return helpfunc_f.helpFunctions.appendErrorToOutput(response);
        }

        // Preparations are done, create the offer
        // TODO: Random generate sale time based on offer pricing
        const offer = this.generateOffer(save_f.server.profiles[sessionID], info.requirements, invItems, info.sellInOnePiece, moneyAmount);
        save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers.push(offer);
        response.ragFairOffers.push(offer);

        // Remove items from inventory after creating offer
        for (const itemToRemove of info.items)
        {
            inventory_f.controller.removeItem(pmcData, itemToRemove, response, sessionID);
        }

        // TODO: Subtract flea market fee from stash

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
            return helpfunc_f.helpFunctions.appendErrorToOutput(item_f.eventHandler.getOutput(), "Offer not found in profile");
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

    getCurrencySymbol(currencyTpl)
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
    }

    formatCurrency(moneyAmount)
    {
        return moneyAmount.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
    }

    completeOffer(sessionID, requirements, moneyAmount, items, offerId)
    {
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
        let itemsToSend = [];
        for (const item of requirements)
        {
            // Create an item of the specified currency
            const moneyItem = {
                "_id": common_f.hash.generate(),
                "_tpl": item._tpl,
                "upd": { "StackObjectsCount": item.count }
            };

            // Split the money stacks in case more than the stack limit is requested
            let stacks = helpfunc_f.helpFunctions.splitStack(moneyItem);
            itemsToSend.push(...stacks);
        }

        // Generate a message to inform that item was sold
        const findItemResult = helpfunc_f.helpFunctions.getItem(itemTpl);
        let messageTpl = database_f.server.tables.locales.global["en"].mail[this.TPL_GOODS_SOLD];

        if (findItemResult[0])
        {
            let tplVars = {
                soldItem: findItemResult[1]._id,
                buyerNickname: this.fetchRandomPmcName(),
                itemCount: itemCount
            };

            try
            {
                const itemLocale = database_f.server.tables.locales.global["en"].templates[findItemResult[1]._id];
                if (itemLocale && itemLocale.Name)
                {
                    tplVars.soldItem = itemLocale.Name;
                }
            }
            catch (err)
            {
                common_f.logger.logError(`Could not get locale data for item with _id -> ${findItemResult[1]._id}`);
            }

            let messageText = messageTpl.replace(/{\w+}/g, function(matched)
            {
                return tplVars[matched.replace(/{|}/g, "")];
            });

            const messageContent = {
                "text": messageText.replace(/"/g, ""),
                "type": 4, // EMessageType.FleamarketMessage
                "maxStorageTime": quest_f.config.redeemTime * 3600,
                "ragfair": {
                    "offerId": offerId,
                    "count": itemCount,
                    "handbookId": itemTpl
                }
            };

            dialogue_f.controller.addDialogueMessage("5ac3b934156ae10c4430e83c", messageContent, sessionID, itemsToSend);

            // TODO: On successful sale, increase rating by expected amount (taken from wiki?)
        }
        return item_f.eventHandler.getOutput();
    }

    returnItems(sessionID, items)
    {
        const messageContent = {
            "text": database_f.server.tables.locales.global["en"].mail[this.TPL_GOODS_RETURNED],
            "type": 13,
            "maxStorageTime": quest_f.config.redeemTime * 3600
        };

        dialogue_f.controller.addDialogueMessage("5ac3b934156ae10c4430e83c", messageContent, sessionID, items);
    }

    generateOffer(profile, requirements, items, sellInOnePiece, amountToSend)
    {
        const formattedItems = items.map(item =>
        {
            return {
                "_id": item._id,
                "_tpl": item._tpl,
                "upd": item.upd
            };
        });

        const formattedRequirements = requirements.map(item =>
        {
            return {
                "_tpl": item._tpl,
                "count": item.count,
                "onlyFunctional": item.onlyFunctional
            };
        });

        return {
            "_id": common_f.hash.generate(),
            "items": formattedItems,
            "root": items[0]._id,
            "requirements": formattedRequirements,
            "sellInOnePiece": sellInOnePiece,
            "startTime": common_f.time.getTimestamp(),
            "endTime": common_f.time.getTimestamp() + (ragfair_f.config.sellTimeHrs * 60 * 60),
            "summaryCost": amountToSend,
            "requirementsCost": amountToSend,
            "loyaltyLevel": 1,
            "user": {
                "id": profile.characters.pmc._id,
                "nickname": profile.characters.pmc.Info.Nickname,
                "rating": profile.characters.pmc.RagfairInfo.rating,
                "memberType": profile.characters.pmc.Info.AccountType,
                "isRatingGrowing": profile.characters.pmc.RagfairInfo.isRatingGrowing
            },
        };
    }

    fetchItemFleaPrice(tpl)
    {
        return Math.round(helpfunc_f.helpFunctions.getTemplatePrice(tpl) * ragfair_f.config.priceMultiplier);
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
            return "Unknown";
        }
    }
}

module.exports.Controller = Controller;
