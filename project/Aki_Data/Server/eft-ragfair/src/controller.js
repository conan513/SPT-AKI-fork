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
        database_f.server.tables.ragfair.offers = [];

        this.TPL_GOODS_SOLD = "5bdac0b686f7743e1665e09e";
        this.TPL_GOODS_RETURNED = "5bdac06e86f774296f5a19c5";

        this.initializeOfferBase();
        this.generateOffers();
    }

    initializeOfferBase()
    {
        // initialize base offer expire date (1 week after server start)
        const time = common_f.time.getTimestamp();
        database_f.server.tables.ragfair.offer.startTime = time;
        database_f.server.tables.ragfair.offer.endTime = time + 604800000;
    }

    generateOffers()
    {
        // single items
        for (const itemID in database_f.server.tables.templates.items)
        {
            this.createItemOffer(itemID);
        }

        // item presets
        for (const presetID in database_f.server.tables.globals.ItemPresets)
        {
            this.createPresetOffer(presetID);
        }

        // traders
        for (const traderID in database_f.server.tables.traders)
        {
            if (traderID === "ragfair" || traderID === "579dc571d53a0658a154fbec")
            {
                // skip ragfair and fence trader
                continue;
            }

            const assort = database_f.server.tables.traders[traderID].assort;

            for (const item of assort.items)
            {
                if (item.slotId !== "hideout")
                {
                    // use only base items
                    continue;
                }

                const items = [...[item], ...helpfunc_f.helpFunctions.findAndReturnChildrenByAssort(item._id, assort.items)];
                const barterScheme = assort.barter_scheme[item._id][0];
                const loyalLevel = assort.loyal_level_items[item._id];

                // add the offer
                this.createTraderOffer(traderID, items, barterScheme, loyalLevel);
            }
        }
    }

    createItemOffer(itemID)
    {
        const item = database_f.server.tables.templates.items[itemID];

        if (!item || item._type === "Node")
        {
            // don't add nodes
            return;
        }

        const price = this.fetchItemFleaPrice(itemID);

        if (price === 0 || price === 1)
        {
            // don't add quest items
            return;
        }

        let offer = common_f.json.clone(database_f.server.tables.ragfair.offer);

        offer._id = itemID;
        offer.items[0]._tpl = itemID;
        offer.requirements[0].count = price;
        offer.itemsCost = price;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        database_f.server.tables.ragfair.offers.push(offer);
    }

    createPresetOffer(presetID)
    {
        if (!preset_f.controller.isPreset(presetID))
        {
            return;
        }

        let offer = common_f.json.clone(database_f.server.tables.ragfair.offer);
        let preset = preset_f.controller.getPreset(presetID);
        let mods = preset._items;
        let rub = 0;

        for (let it of mods)
        {
            rub += helpfunc_f.helpFunctions.getTemplatePrice(it._tpl);
        }

        mods[0].upd = mods[0].upd || {}; // append the stack count
        mods[0].upd.StackObjectsCount = offer.items[0].upd.StackObjectsCount;

        offer._id = preset._id;          // The offer's id is now the preset's id
        offer.root = mods[0]._id;        // Sets the main part of the weapon
        offer.items = mods;
        offer.requirements[0].count = Math.round(rub * ragfair_f.config.priceMultiplier);

        database_f.server.tables.ragfair.offers.push(offer);
    }

    createTraderOffer(traderID, items, barterScheme, loyalLevel)
    {
        const trader = database_f.server.tables.traders[traderID].base;
        let offer = common_f.json.clone(database_f.server.tables.ragfair.offer);

        offer._id = items[0]._id;
        offer.intId = 911;
        offer.user = {
            "id": trader._id,
            "memberType": 4,
            "nickname": trader.surname,
            "rating": 1,
            "isRatingGrowing": true,
            "avatar": trader.avatar
        };
        offer.root = items[0]._id;
        offer.items = items;
        offer.requirements = barterScheme;
        offer.loyaltyLevel = loyalLevel;
        offer.summaryCost = this.calculateCost(barterScheme);

        database_f.server.tables.ragfair.offers.push(offer);
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
        // TODO: Get localized item names
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

    sortOffers(info, offers)
    {
        // Sort results
        switch (info.sortType)
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
                if (info.offerOwnerType === 1)
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
        if (info.sortDirection === 1)
        {
            offers.reverse();
        }

        return offers;
    }

    getOffers(sessionID, info)
    {
        const itemsToAdd = this.filterCategories(sessionID, info);
        let assorts = {};
        let result = {
            "categories": {},
            "offers": [],
            "offersCount": info.limit,
            "selectedCategory": "5b5f78dc86f77409407a7f8e"
        };

        // force player-only in weapon preset build purchase
        // TODO: write cheapes price detection mechanism, prevent trader-player item duplicates
        if (info.buildCount)
        {
            info.offerOwnerType = 2;
            info.onlyFunctional = false;
        }

        // get offer categories
        if (!info.linkedSearchId && !info.neededSearchId)
        {
            for (let offer of database_f.server.tables.ragfair.offers)
            {
                result.categories[offer.items[0]._tpl] = 1;
            }
        }

        // get assorts to compare against
        for (const traderID in database_f.server.tables.traders)
        {
            if (traderID === "ragfair" || traderID === "579dc571d53a0658a154fbec")
            {
                continue;
            }

            assorts[traderID] = trader_f.controller.getAssort(sessionID, traderID);
        }

        // get offers to send
        for (const offer of database_f.server.tables.ragfair.offers)
        {
            if (this.isDisplayableOffer(info, itemsToAdd, assorts, offer))
            {
                result.offers.push(offer);
            }
        }

        // sort offers
        result.offers = this.sortOffers(info, result.offers);
        this.countCategories(result);

        return result;
    }

    filterCategories(sessionID, info)
    {
        let result = [];

        // Case: weapon builds
        if (info.buildCount)
        {
            return Object.keys(info.buildItems);
        }

        // Case: search
        if (info.linkedSearchId)
        {
            result = this.getLinkedSearchList(info.linkedSearchId);
        }
        else if (info.neededSearchId)
        {
            result = this.getNeededSearchList(info.neededSearchId);
        }

        // Case: category
        if (info.handbookId)
        {
            let handbook = this.getCategoryList(info.handbookId);

            if (result.length)
            {
                result = helpfunc_f.helpFunctions.arrayIntersect(result, handbook);
            }
            else
            {
                result = handbook;
            }
        }

        return result;
    }

    isDisplayableOffer(info, itemsToAdd, assorts, offer)
    {
        if (!itemsToAdd.includes(offer.items[0]._tpl))
        {
            // skip items we shouldn't include
            return false;
        }

        if (info.offerOwnerType === 1 && offer.user.memberType !== 4)
        {
            // don't include player offers
            return false;
        }

        if (info.offerOwnerType === 2 && offer.user.memberType === 4)
        {
            // don't include trader offers
            return false;
        }

        if (info.onlyFunctional && preset_f.controller.hasPreset(offer.items[0]._tpl) && !preset_f.controller.isPreset(offer._id))
        {
            // don't include non-functional items
            return false;
        }

        if (info.buildCount && preset_f.controller.hasPreset(offer.items[0]._tpl) && preset_f.controller.isPreset(offer._id))
        {
            // don't include preset items
            return false;
        }

        if (info.removeBartering && !helpfunc_f.helpFunctions.isMoneyTpl(offer.requirements[0]._tpl))
        {
            // don't include barter offers
            return false;
        }

        // handle trader items
        if (offer.user.memberType === 4)
        {
            const flag = assorts[offer.user.id].items.find((item) =>
            {
                return item._id === offer.root;
            });

            if (!flag)
            {
                // skip (quest) locked items
                return false;
            }
        }

        return true;
    }

    calculateCost(barterScheme)
    {
        let summaryCost = 0;

        for (let barter of barterScheme)
        {
            summaryCost += helpfunc_f.helpFunctions.getTemplatePrice(barter._tpl) * barter.count;
        }

        return Math.round(summaryCost);
    }

    fillCatagories(result, filters)
    {
        result.categories = {};

        for (let filter of filters)
        {
            result.categories[filter] = 1;
        }

        return result;
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
    countCategories(result)
    {
        let categ = {};

        for (let offer of result.offers)
        {
            let item = offer.items[0]; // only the first item can have presets

            categ[item._tpl] = categ[item._tpl] || 0;
            categ[item._tpl]++;
        }

        // not in search mode, add back non-weapon items
        for (let c in result.categories)
        {
            if (!categ[c])
            {
                categ[c] = 1;
            }
        }

        result.categories = categ;
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
                profileOffers.splice(index, 1);
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

    addPlayerOffer(pmcData, info, sessionID)
    {
        const result = item_f.eventHandler.getOutput();

        if (!info || !info.items || info.items.length === 0)
        {
            common_f.logger.logError("Invalid addOffer request");
            return helpfunc_f.helpFunctions.appendErrorToOutput(result);
        }

        if (!info.requirements)
        {
            return helpfunc_f.helpFunctions.appendErrorToOutput(result, "How did you place the offer with no requirements?");
        }

        let requirementsPriceInRub = 0,
            offerPrice = 0;

        for (const item of info.requirements)
        {
            let requestedItemTpl = item._tpl;

            if (helpfunc_f.helpFunctions.isMoneyTpl(requestedItemTpl))
            {
                requirementsPriceInRub += helpfunc_f.helpFunctions.inRUB(item.count, requestedItemTpl);
            }
            else
            {
                requirementsPriceInRub += this.fetchItemFleaPrice(requestedItemTpl) * item.count;
            }
        }

        // Count how many items are being sold and multiply the requested amount accordingly
        let itemStackCount = 0,
            invItems = [], basePrice = 0;

        for (const itemId of info.items)
        {
            const item = pmcData.Inventory.items.find(i => i._id === itemId);

            if (!item)
            {
                common_f.logger.logError(`Failed to find item with _id: ${itemId} in inventory!`);
                return helpfunc_f.helpFunctions.appendErrorToOutput(result);
            }



            if (!("upd" in item) || !("StackObjectsCount" in item.upd))
            {
                itemStackCount += 1;
            }
            else
            {
                itemStackCount += item.upd.StackObjectsCount;
            }
            invItems.push(...helpfunc_f.helpFunctions.findAndReturnChildrenAsItems(pmcData.Inventory.items, itemId));
            offerPrice += this.fetchItemFleaPrice(item._tpl) * itemStackCount;
        }

        if (info.sellInOnePiece)
        {
            itemStackCount = 1;
        }

        // offerPrice = offerPrice * itemStackCount;

        if (!invItems || !invItems.length)
        {
            common_f.logger.logError("Could not find any requested items in the inventory");
            return helpfunc_f.helpFunctions.appendErrorToOutput(result);
        }

        for (const item of invItems)
        {
            const mult = ("upd" in item) && ("StackObjectsCount" in item.upd) ? item.upd.StackObjectsCount : 1;
            basePrice += this.fetchItemFleaPrice(item._tpl) * mult;
        }

        if (!basePrice)
        {
            // Don't want to accidentally divide by 0
            common_f.logger.logError("Failed to count base price for offer");
            return helpfunc_f.helpFunctions.appendErrorToOutput(result);
        }

        // Preparations are done, create the offer
        const offer = this.createPlayerOffer(save_f.server.profiles[sessionID], info.requirements, invItems, info.sellInOnePiece, offerPrice);
        save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers.push(offer);
        result.ragFairOffers.push(offer);

        // Remove items from inventory after creating offer
        for (const itemToRemove of info.items)
        {
            inventory_f.controller.removeItem(pmcData, itemToRemove, result, sessionID);
        }

        // TODO: Subtract flea market fee from stash
        if (ragfair_f.config.enableFees)
        {
            let tax = this.calculateTax(info, offerPrice, requirementsPriceInRub);
            common_f.logger.logInfo(`Tax Calculated to be: ${tax}`);
        }

        return result;
    }

    /*
    * from: https://escapefromtarkov.gamepedia.com/Trading#Tax
    *  The fee you'll have to pay to post an offer on Flea Market is calculated using the following formula:
    *     VO × Ti × 4PO × Q + VR × Tr × 4PR × Q
    *  Where:
    *    VO is the total value of the offer, calculated by multiplying the base price of the item times the amount (base price × total item count / Q). The Base Price is a predetermined value for each item.
    *    VR is the total value of the requirements, calculated by adding the product of each requirement base price by their amount.
    *    PO is a modifier calculated as log10(VO / VR).
    *    If VR is less than VO then PO is also raised to the power of 1.08.
    *    PR is a modifier calculated as log10(VR / VO).
    *    If VR is greater or equal to VO then PR is also raised to the power of 1.08.
    *    Q is the "quantity" factor which is either 1 when "Require for all items in offer" is checked or the amount of items being offered otherwise.
    *    Ti and Tr are tax constants currently set to 0.05.
    *    30% of this commission will be deducted if the player has constructed the level 3 Intelligence Center.
    *
    *  After this round the number, if it ends with a decimal point.
    */
    calculateTax(info, offerValue, requirementsValue)
    {
        let Ti = 0.05,
            Tr = 0.05,
            VO = offerValue,
            VR = requirementsValue,
            PO, PR,
            Q = info.sellInOnePiece ? 1 : 0;
        try
        {
            PO = Math.log10(VO / VR);
            if (VR < VO)
            {
                PO = Math.pow(PO, 1.08);
            }
            PR = Math.log10(VR / VO);
            if (VR >= VO)
            {
                PR = Math.pow(PR, 1.08);
            }
            let fee = VO * Ti * Math.pow(4, PO) * Q + VR * Tr * Math.pow(4, PR) * Q;
            return Math.round(fee);
        }
        catch (err)
        {
            common_f.logger.logError(`Tax Calc Error message: ${err}`);
            return 0;
        }

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

    extendOffer(info, sessionID)
    {
        let offerId = info.offerId,
            secondsToAdd = info.renewalTime * 60 * 60,
            feeToPay = 0;

        // TODO: Subtract money and change offer endTime
        const offers = save_f.server.profiles[sessionID].characters.pmc.RagfairInfo.offers;
        const index = offers.findIndex(offer => offer._id === offerId);

        if (index === -1)
        {
            common_f.logger.logWarning(`Could not find offer to remove with offerId -> ${offerId}`);
            return helpfunc_f.helpFunctions.appendErrorToOutput(item_f.eventHandler.getOutput(), "Offer not found in profile");
        }
        offers[index].endTime += secondsToAdd;

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
            const requestedItem = {
                "_id": common_f.hash.generate(),
                "_tpl": item._tpl,
                "upd": { "StackObjectsCount": item.count }
            };

            // Split the money stacks in case more than the stack limit is requested
            let stacks = helpfunc_f.helpFunctions.splitStack(requestedItem);
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

            let messageText = messageTpl.replace(/{\w+}/g, function (matched)
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

    createPlayerOffer(profile, requirements, items, sellInOnePiece, amountToSend)
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
