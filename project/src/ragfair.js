"use strict";

function sortOffersByID(a, b)
{
    return a.intId - b.intId;
}

function sortOffersByRating(a, b)
{
    return a.user.rating - b.user.rating;
}

function sortOffersByName(a, b)
{
    // @TODO: Get localized item names
    try
    {
        let aa = itm_hf.getItem(a._id)[1]._name;
        let bb = itm_hf.getItem(b._id)[1]._name;

        aa = aa.substring(aa.indexOf("_") + 1);
        bb = bb.substring(bb.indexOf("_") + 1);

        return aa.localeCompare(bb);
    }
    catch (e)
    {
        return 0;
    }
}

function sortOffersByPrice(a, b)
{
    return a.requirements[0].count - b.requirements[0].count;
}

function sortOffersByPriceSummaryCost(a,b)
{
    return a.summaryCost - b.summaryCost;
}

function sortOffersByExpiry(a, b)
{
    return a.endTime - b.endTime;
}

function sortOffers(request, offers)
{
    // Sort results
    switch (request.sortType)
    {
        case 0: // ID
            offers.sort(sortOffersByID);
            break;

        case 3: // Merchant (rating)
            offers.sort(sortOffersByRating);
            break;

        case 4: // Offer (title)
            offers.sort(sortOffersByName);
            break;

        case 5: // Price
            if (request.offerOwnerType == 1)
            {
                offers.sort(sortOffersByPriceSummaryCost);
            }
            else
            {
                offers.sort(sortOffersByPrice);
            }

            break;

        case 6: // Expires in
            offers.sort(sortOffersByExpiry);
            break;
    }

    // 0=ASC 1=DESC
    if (request.sortDirection === 1)
    {
        offers.reverse();
    }

    return offers;
}

/* Scans a given slot type for filters and returns them as a Set */
function getFilters(item, slot)
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

/* Like getFilters but breaks early and return true if id is found in filters */
function isInFilter(id, item, slot)
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

/* Because of presets, categories are not always 1 */
function countCategories(response)
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

function getOffers(sessionID, request)
{
    //if its traders items, just a placeholder it will be handled differently later
    if (request.offerOwnerType ===  1)
    {
        return getOffersFromTraders(sessionID, request);
    }

    let response = {"categories": {}, "offers": [], "offersCount": 10, "selectedCategory": "5b5f78dc86f77409407a7f8e"};
    let itemsToAdd = [];
    let offers = [];

    if (!request.linkedSearchId && !request.neededSearchId)
    {
        response.categories = (trader_f.traderServer.getAssort(sessionID, "ragfair")).loyal_level_items;
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
            itemsToAdd = getLinkedSearchList(request.linkedSearchId);
        }
        else if (request.neededSearchId)
        {
            itemsToAdd = getNeededSearchList(request.neededSearchId);
        }

        // Case: category
        if (request.handbookId)
        {
            let handbook = getCategoryList(request.handbookId);

            if (itemsToAdd.length)
            {
                itemsToAdd = itm_hf.arrayIntersect(itemsToAdd, handbook);
            }
            else
            {
                itemsToAdd = handbook;
            }
        }
    }

    for (let item of itemsToAdd)
    {
        offers = offers.concat(createOffer(item, request.onlyFunctional, request.buildCount === 0));
    }

    // merge trader offers with player offers display offers is set to 'ALL'
    if (request.offerOwnerType === 0)
    {
        const traderOffers = getOffersFromTraders(sessionID, request).offers;

        offers = [...offers, ...traderOffers];
    }

    response.offers = sortOffers(request, offers);
    countCategories(response);
    return response;
}

function getOffersFromTraders(sessionID, request)
{
    let jsonToReturn = database_f.database.tables.ragfair.offers;
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
        jsonToReturn = fillCatagories(jsonToReturn,offersFilters);
    }
    else
    {
        // Case: search
        if (request.linkedSearchId)
        {
            //offersFilters.concat( getLinkedSearchList(request.linkedSearchId) );
            offersFilters = [...offersFilters, ...getLinkedSearchList(request.linkedSearchId) ];
            jsonToReturn = fillCatagories(jsonToReturn,offersFilters);
        }
        else if (request.neededSearchId)
        {
            offersFilters = [...offersFilters, ...getNeededSearchList(request.neededSearchId) ];
            jsonToReturn = fillCatagories(jsonToReturn,offersFilters);
        }

        if (request.removeBartering == true)
        {
            jsonToReturn = removeBarterOffers(jsonToReturn);
            jsonToReturn = fillCatagories(jsonToReturn,offersFilters);
        }

        // Case: category
        if (request.handbookId)
        {
            let handbookList = getCategoryList(request.handbookId);

            if (offersFilters.length)
            {
                offersFilters = itm_hf.arrayIntersect(offersFilters, handbookList);
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
            if (jsonToReturn.offers[offer].items[0]._tpl == tplTokeep)
            {
                jsonToReturn.offers[offer].summaryCost = calculateCost(jsonToReturn.offers[offer].requirements);
                // check if offer is really available, removes any quest locked items not in current assort of a trader
                let tmpOffer = jsonToReturn.offers[offer];
                let traderId = tmpOffer.user.id;
                let items = trader_f.traderServer.getAssort(sessionID, traderId).items;
                let keepItem = false; // for testing
                for (let item of items)
                {
                    if (item._id === tmpOffer.root)
                    {
                        offersToKeep.push( jsonToReturn.offers[offer] );
                        keepItem = true;
                        break;
                    }
                }
            }
        }

    }
    jsonToReturn.offers = offersToKeep;
    jsonToReturn.offers = sortOffers(request, jsonToReturn.offers);

    return jsonToReturn;
}

function fillCatagories(response,filters)
{
    response.categories = {};
    for (let filter of filters)
    {
        response.categories[filter] = 1;
    }

    return response;
}

function removeBarterOffers(response)
{
    let override = [];
    for (let offer of response.offers)
    {
        if ( itm_hf.isMoneyTpl(offer.requirements[0]._tpl) == true )
        {
            override.push(offer);
        }
    }
    response.offers = override;
    return response;
}

function calculateCost(barter_scheme)//theorical , not tested not implemented
{
    let summaryCost = 0;

    for (let barter of barter_scheme)
    {
        summaryCost += itm_hf.getTemplatePrice(barter._tpl) * barter.count;
    }

    return Math.round(summaryCost);
}

function getLinkedSearchList(linkedSearchId)
{
    let item = database_f.database.tables.templates.items[linkedSearchId];
    // merging all possible filters without duplicates
    let result = new Set([
        ...getFilters(item, "Slots"),
        ...getFilters(item, "Chambers"),
        ...getFilters(item, "Cartridges")
    ]);

    return Array.from(result);
}

function getNeededSearchList(neededSearchId)
{
    let result = [];

    for (let item of Object.values(database_f.database.tables.templates.items))
    {
        if (isInFilter(neededSearchId, item, "Slots")
         || isInFilter(neededSearchId, item, "Chambers")
         || isInFilter(neededSearchId, item, "Cartridges"))
        {
            result.push(item._id);
        }
    }

    return result;
}

function getCategoryList(handbookId)
{
    let result = [];

    // if its "mods" great-parent category, do double recursive loop
    if (handbookId === "5b5f71a686f77447ed5636ab")
    {
        for (let categ2 of itm_hf.childrenCategories(handbookId))
        {
            for (let categ3 of itm_hf.childrenCategories(categ2))
            {
                result = result.concat(itm_hf.templatesWithParent(categ3));
            }
        }
    }
    else
    {
        if (itm_hf.isCategory(handbookId))
        {
            // list all item of the category
            result = result.concat(itm_hf.templatesWithParent(handbookId));

            for (let categ of itm_hf.childrenCategories(handbookId))
            {
                result = result.concat(itm_hf.templatesWithParent(categ));
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

function createOffer(template, onlyFunc, usePresets = true)
{
    // Some slot filters reference bad items
    if (!(template in database_f.database.tables.templates.items))
    {
        logger.logWarning("Item " + template + " does not exist");
        return [];
    }

    let offerBase = json.parse(json.stringify(database_f.database.tables.ragfair.baseOffer));
    let offers = [];
    let time = Math.floor(new Date().getTime() / 1000);

    // Preset
    if (usePresets && preset_f.itemPresets.hasPreset(template))
    {
        let presets = itm_hf.clone(preset_f.itemPresets.getPresets(template));

        for (let p of presets)
        {
            let offer = itm_hf.clone(offerBase);
            let mods = p._items;
            let rub = 0;

            for (let it of mods)
            {
                rub += itm_hf.getTemplatePrice(it._tpl);
            }

            mods[0].upd = mods[0].upd || {}; // append the stack count
            mods[0].upd.StackObjectsCount = offerBase.items[0].upd.StackObjectsCount;

            offer._id = p._id;               // The offer's id is now the preset's id
            offer.root = mods[0]._id;        // Sets the main part of the weapon
            offer.items = mods;
            offer.requirements[0].count = Math.round(rub * gameplayConfig.trading.ragfairMultiplier);
            offers.push(offer);
            offer.startTime = time;
            offer.emdTime = time * 3153600000;   // 1 century
        }
    }

    // Single item
    if (!preset_f.itemPresets.hasPreset(template) || !onlyFunc)
    {
        let rubPrice = Math.round(itm_hf.getTemplatePrice(template) * gameplayConfig.trading.ragfairMultiplier);
        offerBase._id = template;
        offerBase.items[0]._tpl = template;
        offerBase.requirements[0].count = rubPrice;
        offerBase.itemsCost = rubPrice;
        offerBase.requirementsCost = rubPrice;
        offerBase.summaryCost = rubPrice;
        offerBase.startTime = time;
        offerBase.emdTime = time * 3153600000;   // 1 century
        offers.push(offerBase);
    }

    return offers;
}

//////////////////////////////////////////////////////////////////////////////////////
/// USED BY LOAD() ///////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

function storeOffer(itemsToSell, barter_scheme, loyal_level, traderID, counter = 911)
{
    let offers = [];
    let offerBase = json.parse(json.stringify(database_f.database.tables.ragfair.baseOffer));
    let trader = json.parse(json.read(db.traders["base_" + traderID]));
    let time = Math.floor(new Date().getTime() / 1000);

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
    offerBase.startTime = time;
    offerBase.emdTime = time * 3153600000;   // 1 century

    offers.push(offerBase);
    return offers;
}

//find childs of the item in a given assort (weapons pars for example, need recursive loop function)
function findChildren(itemIdToFind, assort)
{
    let array = [];

    for (let itemFromAssort of assort)
    {
        if (itemFromAssort.parentId == itemIdToFind)
        {
            array.push(itemFromAssort);
            array = array.concat(findChildren(itemFromAssort._id, assort));
        }
    }

    return array;
}

class ragfairServer
{
    initialize()
    {
        let base = {"categories": {}, "offers": [], "offersCount": 100, "selectedCategory": "5b5f78dc86f77409407a7f8e"};
        let counter = 0;

        for (let trader in database_f.database.tables.traders)
        {
            if (trader === "ragfair" || trader === "579dc571d53a0658a154fbec")
            {
                continue;
            }

            let allAssort = database_f.database.tables.traders[trader].assort;

            for (let itemAssort of allAssort.items)
            {
                if (itemAssort.slotId === "hideout")
                {
                    let barter_scheme = null;
                    let loyal_level = 0;

                    let itemsToSell = [];
                    itemsToSell.push(itemAssort);
                    itemsToSell = [...itemsToSell, ...findChildren(itemAssort._id, allAssort.items)];

                    for (let barterFromAssort in allAssort.barter_scheme)
                    {
                        if (itemAssort._id == barterFromAssort)
                        {
                            barter_scheme = allAssort.barter_scheme[barterFromAssort][0];
                            break;
                        }
                    }

                    for (let loyal_levelFromAssort in allAssort.loyal_level_items)
                    {
                        if (itemAssort._id == loyal_levelFromAssort)
                        {
                            loyal_level = allAssort.loyal_level_items[loyal_levelFromAssort];
                            break;
                        }
                    }

                    base.offers = base.offers.concat(storeOffer(itemsToSell, barter_scheme, loyal_level, trader, counter));
                    counter += 1;
                }
            }
        }

        database_f.database.tables.ragfair.offers = base;
    }
}

class RagfairCallbacks
{
    constructor()
    {
        server.addStartCallback("loadRagfair", this.load.bind());
        router.addStaticRoute("/client/ragfair/search", this.search.bind());
        router.addStaticRoute("/client/ragfair/find", this.search.bind());
        router.addStaticRoute("/client/ragfair/itemMarketPrice", this.itemMarketPrice.bind());
        router.addStaticRoute("/client/items/prices", this.getItemPrices.bind());
        item_f.itemServer.addRoute("RagFairAddOffer", this.addOffer.bind());
    }

    load()
    {
        ragfair_f.ragfairServer.initialize();
    }

    search(url, info, sessionID)
    {
        return response_f.getBody(ragfair_f.getOffers(sessionID, info));
    }

    itemMarketPrice(url, info, sessionID)
    {
        return response_f.nullResponse();
    }

    getItemPrices(url, info, sessionID)
    {
        return response_f.nullResponse();
    }

    addOffer()
    {
        return null;
    }
}

module.exports.ragfairServer = new ragfairServer();
module.exports.RagfairCallbacks = new RagfairCallbacks();
module.exports.getOffers = getOffers;
