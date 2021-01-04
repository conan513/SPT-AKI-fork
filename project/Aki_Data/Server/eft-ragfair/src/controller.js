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
        this.TPL_GOODS_SOLD = "5bdac0b686f7743e1665e09e";
        this.TPL_GOODS_RETURNED = "5bdac06e86f774296f5a19c5";
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
        const ia = a.items[0]._tpl;
        const ib = b.items[0]._tpl;
        const aa = database_f.server.tables.locales.global["en"].templates[ia].Name || ia;
        const bb = database_f.server.tables.locales.global["en"].templates[ib].Name || ib;

        return  (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
    }

    sortOffersByPrice(a, b)
    {
        return a.requirementsCost - b.requirementsCost;
    }

    sortOffersByExpiry(a, b)
    {
        return a.endTime - b.endTime;
    }

    sortOffers(offers, type, direction = 0)
    {
        // Sort results
        switch (type)
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
                offers.sort(this.sortOffersByPrice);
                break;

            case 6: // Expires in
                offers.sort(this.sortOffersByExpiry);
                break;
        }

        // 0=ASC 1=DESC
        if (direction === 1)
        {
            offers.reverse();
        }

        return offers;
    }

    getOffers(sessionID, info)
    {
        const itemsToAdd = this.filterCategories(sessionID, info);
        const assorts = this.getDisplayableAssorts(sessionID);
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
            result.categories = ragfair_f.server.categories;
        }

        // get offers to send
        for (const offer of ragfair_f.server.offers)
        {
            if (this.isDisplayableOffer(info, itemsToAdd, assorts, offer))
            {
                result.offers.push(offer);
            }
        }

        // set offer indexes
        let counter = 0;

        for (let offer of result.offers)
        {
            offer.intId = ++counter;
        }

        // sort offers
        result.offers = this.sortOffers(result.offers, info.sortType, info.sortDirection);

        // set categories count
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
            const handbook = this.getCategoryList(info.handbookId);

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

    getDisplayableAssorts(sessionID)
    {
        let result = {};

        for (const traderID in database_f.server.tables.traders)
        {
            if (traderID !== "ragfair" && !ragfair_f.config.static.traders[traderID])
            {
                // skip trader except ragfair when trader is disabled
                continue;
            }

            if (traderID === "ragfair" && !ragfair_f.config.static.items)
            {
                // skip ragfair when unknown is disabled
                continue;
            }

            // add assort to display
            result[traderID] = trader_f.controller.getAssort(sessionID, traderID);
        }

        return result;
    }

    isDisplayableOffer(info, itemsToAdd, assorts, offer)
    {
        const item = offer.items[0];
        const money = offer.requirements[0]._tpl;

        if (!itemsToAdd.includes(item._tpl))
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

        if (info.oneHourExpiration && offer.endTime - common_f.time.getTimestamp() > 3600)
        {
            // offer doesnt expire within an hour
            return false;
        }

        if (info.quantityFrom > 0 && info.quantityFrom >= item.upd.StackObjectsCount)
        {
            // too little items to offer
            return false;
        }

        if (info.quantityTo > 0 && info.quantityTo <= item.upd.StackObjectsCount)
        {
            // too many items to offer
            return false;
        }

        if (info.onlyFunctional && preset_f.controller.hasPreset(item._tpl) && offer.items.length === 1)
        {
            // don't include non-functional items
            return false;
        }

        if (info.buildCount && preset_f.controller.hasPreset(item._tpl) && offer.items.length > 1)
        {
            // don't include preset items
            return false;
        }

        if (item.upd.MedKit || item.upd.Repairable)
        {
            const percentage = 100 * helpfunc_f.helpFunctions.getItemQualityPrice(item);

            if (info.conditionFrom > 0 && info.conditionFrom >= percentage)
            {
                // item condition is too low
                return false;
            }

            if (info.conditionTo < 100 && info.conditionTo <= percentage)
            {
                // item condition is too high
                return false;
            }
        }

        if (info.removeBartering && !helpfunc_f.helpFunctions.isMoneyTpl(money))
        {
            // don't include barter offers
            return false;
        }

        if (info.currency > 0 && helpfunc_f.helpFunctions.isMoneyTpl(money))
        {
            const currencies = ["all", "RUB", "USD", "EUR"];

            if (helpfunc_f.helpFunctions.getCurrencyTag(money) !== currencies[info.currency])
            {
                // don't include item paid in wrong currency
                return false;
            }
        }

        if (info.priceFrom > 0 && info.priceFrom >= offer.requirementsCost)
        {
            // price is too low
            return false;
        }

        if (info.priceTo > 0 && info.priceTo <= offer.requirementsCost)
        {
            // price is too high
            return false;
        }

        // handle trader items
        if (offer.user.id in database_f.server.tables.traders)
        {
            if (!(offer.user.id in assorts))
            {
                // trader not visible on flea market
                return false;
            }

            if (!assorts[offer.user.id].items.find((item) => { return item._id === offer.root; }))
            {
                // skip (quest) locked items
                return false;
            }
        }

        return true;
    }

    fillCatagories(result, filters)
    {
        result.categories = {};

        for (const filter of filters)
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
            for (const categ of helpfunc_f.helpFunctions.childrenCategories(handbookId))
            {
                for (const subcateg of helpfunc_f.helpFunctions.childrenCategories(categ))
                {
                    result = [...result, ...helpfunc_f.helpFunctions.templatesWithParent(subcateg)];
                }
            }

            return result;
        }

        // item is in any other category
        if (helpfunc_f.helpFunctions.isCategory(handbookId))
        {
            // list all item of the category
            result = helpfunc_f.helpFunctions.templatesWithParent(handbookId);

            for (const categ of helpfunc_f.helpFunctions.childrenCategories(handbookId))
            {
                result = [...result, ...helpfunc_f.helpFunctions.templatesWithParent(categ)];
            }

            return result;
        }

        // its a specific item searched
        result.push(handbookId);
        return result;
    }

    getLinkedSearchList(linkedSearchId)
    {
        const item = database_f.server.tables.templates.items[linkedSearchId];

        // merging all possible filters without duplicates
        const result = new Set([
            ...this.getFilters(item, "Slots"),
            ...this.getFilters(item, "Chambers"),
            ...this.getFilters(item, "Cartridges")
        ]);

        return Array.from(result);
    }

    getNeededSearchList(neededSearchId)
    {
        let result = [];

        for (const item of Object.values(database_f.server.tables.templates.items))
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

    /* Because of presets, categories are not always 1 */
    countCategories(result)
    {
        let categories = {};

        for (const offer of result.offers)
        {
            // only the first item can have presets
            const item = offer.items[0];
            categories[item._tpl] = categories[item._tpl] || 0;
            categories[item._tpl]++;
        }

        // not in search mode, add back non-weapon items
        for (const category in result.categories)
        {
            if (!categories[category])
            {
                categories[category] = 1;
            }
        }

        result.categories = categories;
    }

    /* Like getFilters but breaks early and return true if id is found in filters */
    isInFilter(id, item, slot)
    {
        if (!(slot in item._props && item._props[slot].length))
        {
            // item slot doesnt exist
            return false;
        }

        // get slot
        for (const sub of item._props[slot])
        {
            if (!("_props" in sub && "filters" in sub._props))
            {
                // not a filter
                continue;
            }

            // find item in filter
            for (const filter of sub._props.filters)
            {
                if (filter.Filter.includes(id))
                {
                    return true;
                }
            }
        }

        return false;
    }

    /* Scans a given slot type for filters and returns them as a Set */
    getFilters(item, slot)
    {
        let result = new Set();

        if (!(slot in item._props && item._props[slot].length))
        {
            // item slot doesnt exist
            return result;
        }

        for (const sub of item._props[slot])
        {
            if (!("_props" in sub && "filters" in sub._props))
            {
                // not a filter
                continue;
            }

            for (const filter of sub._props.filters)
            {
                for (const f of filter.Filter)
                {
                    result.add(f);
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

            if (common_f.random.getInt(0, 99) < ragfair_f.config.player.sellChance)
            {
                // item sold
                this.completeOffer(sessionID, offer.requirements, offer.summaryCost, offer.items, offer._id);
                profileOffers.splice(index, 1);
            }
        }
    }

    getItemPrice(info)
    {
        // get all items of tpl (sort by price)
        let offers = ragfair_f.server.offers.filter((offer) => { return offer.items[0]._tpl === info.templateId });
        offers = this.sortOffers(offers, 5);
        
        // average
        let avg = 0;

        for (const offer of offers)
        {
            avg += offer.itemsCost;
        }

        return {
            "avg": avg / offers.length,
            "min": offers[0].itemsCost,
            "max": offers[offers.length - 1].itemsCost
        };
    }

    addPlayerOffer(pmcData, info, sessionID)
    {
        const result = item_f.eventHandler.getOutput();
        let requirementsPriceInRub = 0;
        let offerPrice = 0;
        let itemStackCount = 0;
        let invItems = [];
        let basePrice = 0;

        if (!info || !info.items || info.items.length === 0)
        {
            common_f.logger.logError("Invalid addOffer request");
            return helpfunc_f.helpFunctions.appendErrorToOutput(result);
        }

        if (!info.requirements)
        {
            return helpfunc_f.helpFunctions.appendErrorToOutput(result, "How did you place the offer with no requirements?");
        }

        for (const item of info.requirements)
        {
            let requestedItemTpl = item._tpl;

            if (helpfunc_f.helpFunctions.isMoneyTpl(requestedItemTpl))
            {
                requirementsPriceInRub += helpfunc_f.helpFunctions.inRUB(item.count, requestedItemTpl);
            }
            else
            {
                requirementsPriceInRub += ragfair_f.server.prices[requestedItemTpl] * item.count;
            }
        }

        // Count how many items are being sold and multiply the requested amount accordingly
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
            offerPrice += ragfair_f.server.prices[item._tpl] * itemStackCount;
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
            basePrice += ragfair_f.server.prices[item._tpl] * mult;
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
        if (ragfair_f.config.player.enableFees)
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
        let Ti = 0.05;
        let Tr = 0.05;
        let VO = offerValue;
        let VR = requirementsValue;
        let PO = Math.log10(VO / VR);
        let PR = Math.log10(VR / VO);
        let Q = info.sellInOnePiece ? 1 : 0;

        if (VR < VO)
        {
            PO = Math.pow(PO, 1.08);
        }

        if (VR >= VO)
        {
            PR = Math.pow(PR, 1.08);
        }

        const fee = VO * Ti * Math.pow(4, PO) * Q + VR * Tr * Math.pow(4, PR) * Q;
        return Math.round(fee);
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
        let offerId = info.offerId;
        let secondsToAdd = info.renewalTime * 60 * 60;

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
        let itemsToSend = [];

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
        let messageTpl = database_f.server.tables.locales.global["en"].mail[this.TPL_GOODS_SOLD];
        let tplVars = {
            "soldItem": database_f.server.tables.locales.global["en"].templates[itemTpl].Name || itemTpl,
            "buyerNickname": this.fetchRandomPmcName(),
            "itemCount": itemCount
        };
        let messageText = messageTpl.replace(/{\w+}/g, (matched) =>
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
            "endTime": common_f.time.getTimestamp() + (ragfair_f.config.player.sellTimeHrs * 3600),
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

    fetchRandomPmcName()
    {
        const type = common_f.random.getInt(0, 1) === 0 ? "usec" : "bear";
        return common_f.random.getArrayValue(database_f.server.tables.bots.types[type].names);
    }
}

module.exports.Controller = Controller;
