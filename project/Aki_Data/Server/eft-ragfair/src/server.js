/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Server
{
    constructor()
    {
        this.prices = {};
        this.offers = [];
        this.categories = {};
    }

    load()
    {
        // get item prices
        this.getItemPrices();

        // get generated offers
        this.generateTraderOffers();
        
        if (ragfair_f.config.dynamic.enabled)
        {
            this.generateDynamicOffers();
        }
        else
        {
            this.generateStaticOffers();
        }

        // get available categories
        this.generateCategories();
    }

    update()
    {
        if (!ragfair_f.config.dynamic.enabled)
        {
            // offers are static
            return;
        }

        // remove expired offers
        const time = common_f.time.getTimestamp();

        for (const offer in this.offers)
        {
            if (this.offers[offer].endTime < time)
            {
                this.offers.splice(offer, 1);
            }
        }

        // generate new offers
        if (this.offers.length < ragfair_f.config.dynamic.threshold)
        {
            this.generateDynamicOffers();
            this.generateCategories();
        }
    }

    generateTraderOffers()
    {
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

    generateDynamicOffers()
    {
        const count = ragfair_f.config.dynamic.threshold + ragfair_f.config.dynamic.batchSize;
        const presets = Object.keys(database_f.server.tables.globals.ItemPresets);
        const items = Object.keys(database_f.server.tables.templates.items).filter((item) => {
            return item._type !== "Node";
        });

        while (this.offers.length < count)
        {
            const generatePreset = common_f.random.getInt(0, 99) < ragfair_f.config.dynamic.presetChance;

            if (generatePreset)
            {
                // generate preset offer
                this.createPresetOffer(common_f.random.getArrayValue(presets));
            }
            else
            {
                // generate item offer
                this.createItemOffer(common_f.random.getArrayValue(items));
            }
        }
    }

    generateStaticOffers()
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
    }

    generateCategories()
    {
        for (const offer of this.offers)
        {
            this.categories[offer.items[0]._tpl] = 1;
        }
    }

    getOfferTemplate()
    {
        const startTime = common_f.time.getTimestamp();
        const offer = {
            "_id": "hash",
            "intId": 0,
            "user": {
                "id": "0",
                "memberType": 0,
                "nickname": "Unknown",
                "rating": 100,
                "isRatingGrowing": true,
                "avatar": "/files/trader/avatar/unknown.jpg"
            },
            "root": "5cf5e9f402153a196f20e270",
            "items": [
                {
                    "_id": "5cf5e9f402153a196f20e270",
                    "_tpl": "54009119af1c881c07000029",
                    "upd": {
                        "UnlimitedCount": true,
                        "StackObjectsCount": 1
                    }
                }
            ],
            "requirements": [
                {
                    "count": 1,
                    "_tpl": "5449016a4bdc2d6f028b456f"
                }
            ],
            "requirementsCost": 0,
            "itemsCost": 0,
            "summaryCost": 0,
            "startTime": startTime,
            "endTime": this.getOfferEndTime(startTime),
            "loyaltyLevel": 1,
            "sellInOnePiece": false,
            "priority": false
        }

        return offer;
    }

    createItemOffer(itemID)
    {
        const item = database_f.server.tables.templates.items[itemID];

        if (item._type === "Node")
        {
            // don't add nodes
            return;
        }

        let price = this.prices[itemID];

        if (price === 0 || price === 1)
        {
            // don't add quest items
            return;
        }

        let offer = this.getOfferTemplate();

        price *= this.getOfferPriceMultiplier();
        offer._id = itemID;
        offer.items[0]._tpl = itemID;
        offer.items[0].upd.StackObjectsCount = this.getOfferStackSize();
        offer.requirements[0].count = price;
        offer.itemsCost = price;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        this.offers.push(offer);
    }

    createPresetOffer(presetID)
    {
        const preset = preset_f.controller.getPreset(presetID);
        let offer = this.getOfferTemplate();
        let mods = preset._items;
        let price = 0;

        for (const it of mods)
        {
            price += this.prices[it._tpl];
        }

        price *= this.getOfferPriceMultiplier();

        mods[0].upd = mods[0].upd || {}; // append the stack count
        mods[0].upd.StackObjectsCount = 1;

        offer._id = preset._id;          // The offer's id is now the preset's id
        offer.root = mods[0]._id;        // Sets the main part of the weapon
        offer.items = mods;
        offer.requirements[0].count = price;
        offer.itemsCost = price;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        this.offers.push(offer);
    }

    createTraderOffer(traderID, items, barterScheme, loyalLevel)
    {
        const trader = database_f.server.tables.traders[traderID].base;
        const price = this.getTraderItemPrice(barterScheme);
        let offer = this.getOfferTemplate();

        offer._id = items[0]._id;
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
        offer.requirementsCost = price;
        offer.summaryCost = price;
        offer.endTime = ragfair_f.config.static.timeMax * 60;

        this.offers.push(offer);
    }

    getOfferEndTime(timestamp)
    {
        if (ragfair_f.config.dynamic.enabled)
        {
            return timestamp + common_f.random.getInt(ragfair_f.config.dynamic.timeMin, ragfair_f.config.dynamic.timeMax) * 60;
        }
        
        return timestamp + ragfair_f.config.static.timeMax * 60;
    }

    getOfferPriceMultiplier()
    {
        if (ragfair_f.config.dynamic.enabled)
        {
            return common_f.random.getFloat(ragfair_f.config.dynamic.priceMin, ragfair_f.config.dynamic.priceMax);
        }
        
        return ragfair_f.config.static.pricePerc;
    }

    getOfferStackSize()
    {
        if (ragfair_f.config.dynamic.enabled)
        {
            return common_f.random.getInt(ragfair_f.config.dynamic.stackMin, ragfair_f.config.dynamic.stackMax);   
        }

        return ragfair_f.config.static.stackSize;
    }

    getTraderItemPrice(barterScheme)
    {
        let price = 0;

        for (const barter of barterScheme)
        {
            price += this.prices[barter._tpl] * barter.count;
        }

        return Math.round(price);
    }

    getItemPrices()
    {
        let prices = {};

        for (const itemID in database_f.server.tables.templates.items)
        {
            if (database_f.server.tables.templates.items[itemID]._type !== "Node")
            {
                prices[itemID] = Math.round(helpfunc_f.helpFunctions.getTemplatePrice(itemID));
            }
        }

        this.prices = prices;
    }
}

module.exports.Server = Server;
