"use strict";

require("../Lib.js");

class RagfairController
{
    static TPL_GOODS_SOLD = "5bdac0b686f7743e1665e09e";
    static TPL_GOODS_RETURNED = "5bdac06e86f774296f5a19c5";

    static sortOffersByID(a, b)
    {
        return a.intId - b.intId;
    }

    static sortOffersByRating(a, b)
    {
        return a.user.rating - b.user.rating;
    }

    static sortOffersByName(a, b)
    {
        const ia = a.items[0]._tpl;
        const ib = b.items[0]._tpl;
        const aa = DatabaseServer.tables.locales.global["en"].templates[ia].Name || ia;
        const bb = DatabaseServer.tables.locales.global["en"].templates[ib].Name || ib;

        return (aa < bb) ? -1 : (aa > bb) ? 1 : 0;
    }

    static sortOffersByPrice(a, b)
    {
        return a.requirementsCost - b.requirementsCost;
    }

    static sortOffersByExpiry(a, b)
    {
        return a.endTime - b.endTime;
    }

    static sortOffers(offers, type, direction = 0)
    {
        // Sort results
        switch (type)
        {
            case 0: // ID
                offers.sort(RagfairController.sortOffersByID);
                break;

            case 3: // Merchant (rating)
                offers.sort(RagfairController.sortOffersByRating);
                break;

            case 4: // Offer (title)
                offers.sort(RagfairController.sortOffersByName);
                break;

            case 5: // Price
                offers.sort(RagfairController.sortOffersByPrice);
                break;

            case 6: // Expires in
                offers.sort(RagfairController.sortOffersByExpiry);
                break;
        }

        // 0=ASC 1=DESC
        if (direction === 1)
        {
            offers.reverse();
        }

        return offers;
    }

    static getOffers(sessionID, info)
    {
        const itemsToAdd = RagfairController.filterCategories(sessionID, info);
        const assorts = RagfairController.getDisplayableAssorts(sessionID);
        let result = {
            "categories": {},
            "offers": [],
            "offersCount": info.limit,
            "selectedCategory": "5b5f78dc86f77409407a7f8e"
        };

        // force all trader types in weapon preset build purchase
        if (info.buildCount)
        {
            info.offerOwnerType = 0;
            info.onlyFunctional = false;
        }

        // get offer categories
        if (!info.linkedSearchId && !info.neededSearchId)
        {
            result.categories = RagfairServer.categories;
        }

        result.offers = info.buildCount ? RagfairController.getOffersForBuild(info, itemsToAdd, assorts) :
            RagfairController.getValidOffers(info, itemsToAdd, assorts);

        // set offer indexes
        let counter = 0;

        for (let offer of result.offers)
        {
            offer.intId = ++counter;
        }

        // sort offers
        result.offers = RagfairController.sortOffers(result.offers, info.sortType, info.sortDirection);

        // set categories count
        RagfairController.countCategories(result);

        return result;
    }

    static getValidOffers(info, itemsToAdd, assorts)
    {
        let offers = [];
        for (const offer of RagfairServer.offers)
        {
            if (RagfairController.isDisplayableOffer(info, itemsToAdd, assorts, offer))
            {
                offers.push(offer);
            }
        }
        return offers;
    }

    static getOffersForBuild(info, itemsToAdd, assorts)
    {
        let offersMap = new Map();
        let offers = [];

        for (const offer of RagfairServer.offers)
        {
            if (RagfairController.isDisplayableOffer(info, itemsToAdd, assorts, offer))
            {
                let key = offer.items[0]._tpl;
                if (!offersMap.has(key))
                {
                    offersMap.set(key, []);
                }

                offersMap.get(key).push(offer);
            }
        }

        for (let tmpOffers of offersMap.values())
        {
            let offer = RagfairController.sortOffers(tmpOffers, 5, 0)[0];
            offers.push(offer);
        }

        return offers;
    }

    static filterCategories(sessionID, info)
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
            result = RagfairController.getLinkedSearchList(info.linkedSearchId);
        }
        else if (info.neededSearchId)
        {
            result = RagfairController.getNeededSearchList(info.neededSearchId);
        }

        // Case: category
        if (info.handbookId)
        {
            const handbook = RagfairController.getCategoryList(info.handbookId);

            if (result.length)
            {
                result = PlzRefactorMeHelper.arrayIntersect(result, handbook);
            }
            else
            {
                result = handbook;
            }
        }

        return result;
    }

    static getDisplayableAssorts(sessionID)
    {
        let result = {};

        for (const traderID in DatabaseServer.tables.traders)
        {
            if (!RagfairConfig.traders[traderID])
            {
                continue;
            }

            result[traderID] = TraderController.getAssort(sessionID, traderID);
        }

        return result;
    }

    static isDisplayableOffer(info, itemsToAdd, assorts, offer)
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

        if (info.oneHourExpiration && offer.endTime - TimeUtil.getTimestamp() > 3600)
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

        if (info.onlyFunctional && PresetController.hasPreset(item._tpl) && offer.items.length === 1)
        {
            // don't include non-functional items
            return false;
        }

        if (info.buildCount && PresetController.hasPreset(item._tpl) && offer.items.length > 1)
        {
            // don't include preset items
            return false;
        }

        if (item.upd.MedKit || item.upd.Repairable)
        {
            const percentage = 100 * ItemHelper.getItemQualityPrice(item);

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

        if (info.removeBartering && !PlzRefactorMeHelper.isMoneyTpl(money))
        {
            // don't include barter offers
            return false;
        }

        if (info.currency > 0 && PlzRefactorMeHelper.isMoneyTpl(money))
        {
            const currencies = ["all", "RUB", "USD", "EUR"];

            if (PlzRefactorMeHelper.getCurrencyTag(money) !== currencies[info.currency])
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
        if (offer.user.id in DatabaseServer.tables.traders)
        {
            if (!(offer.user.id in assorts))
            {
                // trader not visible on flea market
                return false;
            }

            if (!assorts[offer.user.id].items.find((item) =>
            {
                return item._id === offer.root;
            }))
            {
                // skip (quest) locked items
                return false;
            }
        }

        return true;
    }

    static fillCatagories(result, filters)
    {
        result.categories = {};

        for (const filter of filters)
        {
            result.categories[filter] = 1;
        }

        return result;
    }

    static getCategoryList(handbookId)
    {
        let result = [];

        // if its "mods" great-parent category, do double recursive loop
        if (handbookId === "5b5f71a686f77447ed5636ab")
        {
            for (const categ of PlzRefactorMeHelper.childrenCategories(handbookId))
            {
                for (const subcateg of PlzRefactorMeHelper.childrenCategories(categ))
                {
                    result = [...result, ...PlzRefactorMeHelper.templatesWithParent(subcateg)];
                }
            }

            return result;
        }

        // item is in any other category
        if (PlzRefactorMeHelper.isCategory(handbookId))
        {
            // list all item of the category
            result = PlzRefactorMeHelper.templatesWithParent(handbookId);

            for (const categ of PlzRefactorMeHelper.childrenCategories(handbookId))
            {
                result = [...result, ...PlzRefactorMeHelper.templatesWithParent(categ)];
            }

            return result;
        }

        // its a specific item searched
        result.push(handbookId);
        return result;
    }

    static getLinkedSearchList(linkedSearchId)
    {
        const item = DatabaseServer.tables.templates.items[linkedSearchId];

        // merging all possible filters without duplicates
        const result = new Set([
            ...RagfairController.getFilters(item, "Slots"),
            ...RagfairController.getFilters(item, "Chambers"),
            ...RagfairController.getFilters(item, "Cartridges")
        ]);

        return Array.from(result);
    }

    static getNeededSearchList(neededSearchId)
    {
        let result = [];

        for (const item of Object.values(DatabaseServer.tables.templates.items))
        {
            if (RagfairController.isInFilter(neededSearchId, item, "Slots")
                || RagfairController.isInFilter(neededSearchId, item, "Chambers")
                || RagfairController.isInFilter(neededSearchId, item, "Cartridges"))
            {
                result.push(item._id);
            }
        }

        return result;
    }

    /* Because of presets, categories are not always 1 */
    static countCategories(result)
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
    static isInFilter(id, item, slot)
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
    static getFilters(item, slot)
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

    static update()
    {
        for (const sessionID in SaveServer.profiles)
        {
            if (SaveServer.profiles[sessionID].characters.pmc.RagfairInfo !== undefined)
            {
                RagfairController.processOffers(sessionID);
            }
        }
    }

    static processOffers(sessionID)
    {
        const timestamp = TimeUtil.getTimestamp();
        
        for (const sessionID in SaveServer.profiles)
        {
            const profileOffers = RagfairController.getProfileOffers(sessionID);

            if (!profileOffers || !profileOffers.length)
            {
                continue;
            }

            for (const [index, offer] of profileOffers.entries())
            {
				if (offer.sellResult && offer.sellResult.length > 0 && timestamp >= offer.sellResult[0].sellTime)
				{
					// Item sold
					let totalItemsCount = 1;
					let boughtAmount = 1;
					
					if (!offer.sellInOnePiece)
					{
						totalItemsCount = offer.items.reduce((sum, item) => sum += item.upd.StackObjectsCount, 0);
						boughtAmount = offer.sellResult[0].amount;
					}
					
					// Increase rating
					SaveServer.profiles[sessionID].characters.pmc.RagfairInfo.rating += RagfairConfig.reputation.gain * offer.summaryCost / totalItemsCount * boughtAmount;
					RagfairController.completeOffer(sessionID, offer, index, boughtAmount);
					offer.sellResult.splice(0, 1);
				}
            }
        }

        return true;
    }

    static getProfileOffers(sessionID)
    {
        const profile = ProfileController.getPmcProfile(sessionID);

        if (profile.RagfairInfo === undefined || profile.RagfairInfo.offers === undefined)
        {
            return [];
        }

        return profile.RagfairInfo.offers;
    }

    static getProfileOfferByIndex(sessionID, index)
    {
        const offers = RagfairController.getProfileOffers(sessionID);
        if (offers[index] !== undefined)
        {
            return offers[index];
        }
        return [];
    }

    static deleteOfferByIndex(sessionID, index)
    {
        SaveServer.profiles[sessionID].characters.pmc.RagfairInfo.offers.splice(index, 1);
    }

    static updateOfferItemsByIndex(sessionID, index, newValues)
    {
        SaveServer.profiles[sessionID].characters.pmc.RagfairInfo.offers[index].items = newValues;
    }

    static getItemPrice(info)
    {
        // get all items of tpl (sort by price)
        let offers = RagfairServer.offers.filter((offer) =>
        {
            return offer.items[0]._tpl === info.templateId;
        });
        
        offers = RagfairController.sortOffers(offers, 5);

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

    /**
     * Merges Stackable Items
     * Ragfair allows abnormally large stacks.
     */
    static mergeStackable(items)
    {
        let mergeItems = {};
        let mergedStacks = [];

        items.forEach(item =>
        {
            item = ItemHelper.fixItemStackCount(item);

            if (ItemHelper.isItemTplStackable(item._tpl) && item.parentId === "hideout")
            {
                if (mergeItems[item._tpl] === undefined)
                {
                    mergeItems[item._tpl] = 0;
                }

                mergeItems[item._tpl] += item.upd.StackObjectsCount;
            }
            else
            {
                mergedStacks.push(item);
            }
        });

        if (Object.keys(mergeItems).length)
        {
            for (const tpl in mergeItems)
            {
                mergedStacks.push({
                    "_id": HashUtil.generate(),
                    "_tpl": tpl,
                    "upd": {
                        StackObjectsCount: mergeItems[tpl]
                    }
                });
            }
        }

        return mergedStacks;
    }

    static calculateSellChance(baseChance, offerPrice, requirementsPriceInRub)
	{
        const multiplier = (requirementsPriceInRub > offerPrice) ? RagfairConfig.chance.overpriced
                         : (requirementsPriceInRub < offerPrice) ? RagfairConfig.chance.underpriced
                         : 1;
		return Math.round(baseChance * (offerPrice / requirementsPriceInRub * multiplier));
	}
	
	static rollForSale(sellChance, count)
	{
		const startTime = TimeUtil.getTimestamp();
		const endTime = startTime + 12 * 3600;
        const chance = 100 - Math.min(Math.max(sellChance, 0), 100);
		let sellTime = startTime;
		let remainingCount = count;
		let result = [];
		
		Logger.info(`Rolling for sell ${count} items (chance: ${sellChance})`);

		while (remainingCount > 0 && sellTime < endTime)
		{
			if (RandomUtil.getInt(0, 99) < sellChance)
			{
				const boughtAmount = RandomUtil.getInt(1, remainingCount);

				sellTime += Math.max(Math.round(chance / 100 * RagfairConfig.time.max * 60), RagfairConfig.time.min * 60);
				result.push({
					"sellTime": sellTime,
					"amount": boughtAmount
				});

				remainingCount -= boughtAmount;
			}
		}
		
		return result;
	}

    static addPlayerOffer(pmcData, info, sessionID)
    {
        const result = ItemEventRouter.getOutput();
        let requirementsPriceInRub = 0;
        let offerPrice = 0;
        let itemStackCount = 0;
        let invItems = [];
        let basePrice = 0;

        if (!info || !info.items || info.items.length === 0)
        {
            Logger.error("Invalid addOffer request");
            return HttpResponse.appendErrorToOutput(result);
        }

        if (!info.requirements)
        {
            return HttpResponse.appendErrorToOutput(result, "How did you place the offer with no requirements?");
        }

        for (const item of info.requirements)
        {
            const requestedItemTpl = item._tpl;

            if (PlzRefactorMeHelper.isMoneyTpl(requestedItemTpl))
            {
                requirementsPriceInRub += PlzRefactorMeHelper.inRUB(item.count, requestedItemTpl);
            }
            else
            {
                requirementsPriceInRub += RagfairServer.prices.dynamic[requestedItemTpl] * item.count;
            }
        }
		
		let sellChance = RagfairConfig.sell.base;

        // Count how many items are being sold and multiply the requested amount accordingly
        for (const itemId of info.items)
        {
            let item = pmcData.Inventory.items.find(i => i._id === itemId);

            if (item === undefined)
            {
                Logger.error(`Failed to find item with _id: ${itemId} in inventory!`);
                return HttpResponse.appendErrorToOutput(result);
            }

            item = ItemHelper.fixItemStackCount(item);
            itemStackCount += item.upd.StackObjectsCount;
            invItems.push(...ItemHelper.findAndReturnChildrenAsItems(pmcData.Inventory.items, itemId));

			const qualityMultiplier = ItemHelper.getItemQualityPrice(item);

            offerPrice += RagfairServer.prices.dynamic[item._tpl] * item.upd.StackObjectsCount * qualityMultiplier;
			sellChance = RagfairConfig.sell.base * qualityMultiplier;
        }

        if (info.sellInOnePiece)
        {
            itemStackCount = 1;
        }

        // offerPrice = offerPrice * itemStackCount;
        if (!invItems || !invItems.length)
        {
            Logger.error("Could not find any requested items in the inventory");
            return HttpResponse.appendErrorToOutput(result);
        }

        for (const item of invItems)
        {
            const mult = (item.upd === undefined) || (item.upd.StackObjectsCount === undefined) ? 1 : item.upd.StackObjectsCount;
            basePrice += RagfairServer.prices.dynamic[item._tpl] * mult;
        }

        if (!basePrice)
        {
            // Don't want to accidentally divide by 0
            Logger.error("Failed to count base price for offer");
            return HttpResponse.appendErrorToOutput(result);
        }

        // Preparations are done, create the offer
        const offer = RagfairController.createPlayerOffer(SaveServer.profiles[sessionID], info.requirements, RagfairController.mergeStackable(invItems), info.sellInOnePiece, requirementsPriceInRub);
		
		sellChance = SellToFleaMarket.calculateSellChance(sellChance, offerPrice / itemStackCount, requirementsPriceInRub);
		offer.sellResult = SellToFleaMarket.rollForSale(sellChance, info.sellInOnePiece ? 1 : itemStackCount);
        SaveServer.profiles[sessionID].characters.pmc.RagfairInfo.offers.push(offer);
        result.ragFairOffers.push(offer);

        // Remove items from inventory after creating offer
        for (const itemToRemove of info.items)
        {
            InventoryController.removeItem(pmcData, itemToRemove, result, sessionID);
        }

        // Subtract flea market fee from stash
        if (RagfairConfig.sell.fees)
        {
            const tax = RagfairController.calculateTax(info, offerPrice / itemStackCount, requirementsPriceInRub, itemStackCount);

            Logger.info(`Tax Calculated to be: ${tax}`);
			
			const request = {
				"tid": "ragfair",
				"Action": "TradingConfirm",
				"scheme_items": [{
					"id": PlzRefactorMeHelper.getCurrency("RUB"),
					"count": tax
				}]
			};
			
			if (!PlzRefactorMeHelper.payMoney(pmcData, request, sessionID))
			{
				return HttpResponse.appendErrorToOutput(result, "Transaction failed: Couldn't pay commission fee");
			}
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
    static calculateTax(info, offerValue, requirementsValue, quantity)
    {
        let Ti = 0.05;
        let Tr = 0.05;
        let VO = Math.round(offerValue);
        let VR = Math.round(requirementsValue);
        let PO = Math.log10(VO / VR);
        let PR = Math.log10(VR / VO);
        let Q = info.sellInOnePiece ? 1 : quantity;

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

    /*
     *  User requested removal of the offer, actually reduces the time to 71 seconds,
     *  allowing for the possibility of extending the auction before it's end time
     */
    static removeOffer(offerId, sessionID)
    {
        const offers = SaveServer.profiles[sessionID].characters.pmc.RagfairInfo.offers;
        const index = offers.findIndex(offer => offer._id === offerId);

        if (index === -1)
        {
            Logger.warning(`Could not find offer to remove with offerId -> ${offerId}`);
            return HttpResponse.appendErrorToOutput(ItemEventRouter.getOutput(), "Offer not found in profile");
        }

        let differenceInMins = (offers[index].endTime - TimeUtil.getTimestamp()) / 6000;

        if (differenceInMins > 1)
        {
            let newEndTime = 71 + TimeUtil.getTimestamp();
            offers[index].endTime = Math.round(newEndTime);
        }

        return ItemEventRouter.getOutput();
    }

    static extendOffer(info, sessionID)
    {
        const offers = SaveServer.profiles[sessionID].characters.pmc.RagfairInfo.offers;
        const index = offers.findIndex(offer => offer._id === info.offerId);
        const secondsToAdd = info.renewalTime * 3600;

        if (index === -1)
        {
            Logger.warning(`Could not find offer to remove with offerId -> ${info.offerId}`);
            return HttpResponse.appendErrorToOutput(ItemEventRouter.getOutput(), "Offer not found in profile");
        }
		
		// MOD: Pay flea market fee
        if (RagfairConfig.sell.fees)
        {
			const count = offers[index].sellInOnePiece ? 1 : offers[index].items.reduce((sum, item) => sum += item.upd.StackObjectsCount, 0);
            const tax = RagfairController.calculateTax({"sellInOnePiece": offers[index].sellInOnePiece}, offers[index].itemsCost / count, offers[index].requirementsCost, count) * 0.1 * info.renewalTime;
            
            Logger.info(`Tax Calculated to be: ${tax}`);
			
			const request = {
				"tid": "ragfair",
				"Action": "TradingConfirm",
				"scheme_items": [{
					"id": PlzRefactorMeHelper.getCurrency("RUB"),
					"count": tax
				}]
			};
			
			if (!PlzRefactorMeHelper.payMoney(SaveServer.profiles[sessionID].characters.pmc, request, sessionID))
			{
				return HttpResponse.appendErrorToOutput(ItemEventRouter.getOutput(), "Transaction failed: Couldn't pay commission fee");
			}
        }

        offers[index].endTime += secondsToAdd;
        return ItemEventRouter.getOutput();
    }

    static getCurrencySymbol(currencyTpl)
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

    static formatCurrency(moneyAmount)
    {
        return moneyAmount.toString().replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
    }

    static completeOffer(sessionID, offer, offerId, boughtAmount)
    {
        const parent = offer.items.filter(offerItem => offerItem.parentId === "hideout");
        const itemTpl = parent[0]._tpl;
        let itemsToSend = [];

        if (offer.sellInOnePiece)
        {
            for (let item of offer.items)
            {
                item = ItemHelper.fixItemStackCount(item);
            }

			RagfairController.deleteOfferByIndex(sessionID, offerId);
        }
        else
        {
            // Is this multiple items or one stack of same item?
            if (offer.items.length > 1)
            {
                if (boughtAmount < parent.length)
                {
                    for (let i = 0; i < boughtAmount; i++)
                    {
                        const toDelete = ItemHelper.findAndReturnChildrenByItems(offer.items, parent[i]._id);

                        for (const toDeleteId of toDelete)
                        {
                            offer.items.splice(offer.items.findIndex(item => item._id === toDeleteId), 1);
                        }
                    }
                }
                else
                {
                    RagfairController.deleteOfferByIndex(sessionID, offerId);
                }
            }
            else
            {
                if (offer.items[0].upd.StackObjectsCount === undefined || offer.items[0].upd.StackObjectsCount === 1)
                {
                    RagfairController.deleteOfferByIndex(sessionID, offerId);
                }
                else
                {
                    boughtAmount = RandomUtil.getInt(1, offer.items[0].upd.StackObjectsCount);

                    if (boughtAmount < offer.items[0].upd.StackObjectsCount)
                    {
                        offer.items[0].upd.StackObjectsCount -= boughtAmount;
                    }
                    else
                    {
                        RagfairController.deleteOfferByIndex(sessionID, offerId);
                    }
                }
            }
        }

        // assemble the payment items
        for (const requirement of offer.requirements)
        {
            // Create an item template item
            const requestedItem = {
                "_id": HashUtil.generate(),
                "_tpl": requirement._tpl,
                "upd": { "StackObjectsCount": requirement.count * boughtAmount }
            };

            let stacks = ItemHelper.splitStack(requestedItem);

            for (const item of stacks)
            {
                let outItems = [item];
                
                if (requirement.onlyFunctional)
                {
                    const presetItems = RagfairServer.getPresetItemsByTpl(item);

                    if (presetItems.length)
                    {
                        outItems = presetItems[0];
                    }
                }

                itemsToSend = [...itemsToSend, ...outItems];
            }
        }

        // Generate a message to inform that item was sold
        const messageTpl = DatabaseServer.tables.locales.global["en"].mail[RagfairController.TPL_GOODS_SOLD];
        const tplVars = {
            "soldItem": DatabaseServer.tables.locales.global["en"].templates[itemTpl].Name || itemTpl,
            "buyerNickname": RagfairController.fetchRandomPmcName(),
            "itemCount": boughtAmount
        };
        const messageText = messageTpl.replace(/{\w+}/g, (matched) =>
        {
            return tplVars[matched.replace(/{|}/g, "")];
        });

        const messageContent = {
            "text": messageText.replace(/"/g, ""),
            "type": 4, // EMessageType.FleamarketMessage
            "maxStorageTime": QuestConfig.redeemTime * 3600,
            "ragfair": {
                "offerId": offerId,
                "count": boughtAmount,
                "handbookId": itemTpl
            }
        };

        DialogueController.addDialogueMessage("5ac3b934156ae10c4430e83c", messageContent, sessionID, itemsToSend);
        return ItemEventRouter.getOutput();
    }

    static returnItems(sessionID, items)
    {
        const messageContent = {
            "text": DatabaseServer.tables.locales.global["en"].mail[RagfairController.TPL_GOODS_RETURNED],
            "type": 13,
            "maxStorageTime": QuestConfig.redeemTime * 3600
        };

        DialogueController.addDialogueMessage("5ac3b934156ae10c4430e83c", messageContent, sessionID, items);
    }

    static createPlayerOffer(profile, requirements, items, sellInOnePiece, amountToSend)
    {
        let loyalLevel = 1;
        const formattedItems = items.map(item =>
        {
            let isChild = items.find(it => it._id === item.parentId);
            return {
                "_id": item._id,
                "_tpl": item._tpl,
                "parentId": (isChild) ? item.parentId : "hideout",
                "slotId": (isChild) ? item.slotId : "hideout",
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

        return RagfairServer.createOffer(
            profile.characters.pmc.aid,
            TimeUtil.getTimestamp(),
            formattedItems,
            formattedRequirements,
            loyalLevel,
            amountToSend,
            sellInOnePiece
        );
    }
}

module.exports = RagfairController;
