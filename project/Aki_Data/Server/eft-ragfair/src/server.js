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

        // load offers
        this.update();
    }

    // todo: move player offer code here
    update()
    {
        // remove expired offers
        const time = common_f.time.getTimestamp();

        for (const i in this.offers)
        {
            if (this.isExpired(this.offers[i], time))
            {
                this.offers.splice(i, 1);
            }
        }

        // generate new offers
        for (const traderID in database_f.server.tables.traders)
        {
            if (!this.offers.find((offer) => { return offer.user.memberType === 4 && offer.user.id === traderID}))
            {
                // trader offers expired
                this.generateTraderOffers(traderID);
            }
        }
        
        if (ragfair_f.config.dynamic.enabled)
        {
            if (this.offers.length < ragfair_f.config.dynamic.threshold)
            {
                // offer count below threshold
                this.generateDynamicOffers();
            }
        }
        else
        {
            if (!this.offers.find((offer) => { return offer.user.memberType !== 4}))
            {
                // static offers expired
                this.generateStaticOffers();
            }
        }
        
        // set available categories
        for (const offer of this.offers)
        {
            this.categories[offer.items[0]._tpl] = 1;
        }
    }

    generateTraderOffers(traderID)
    {
        if (traderID === "ragfair" || traderID === "579dc571d53a0658a154fbec")
        {
            // skip ragfair and fence trader
            return;
        }

        const assort = database_f.server.tables.traders[traderID].assort;

        // add trader offers
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
            
            this.createTraderOffer(traderID, items, barterScheme, loyalLevel);
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

    getOfferTemplate()
    {
        const startTime = common_f.time.getTimestamp();
        const offer = {
            "_id": "hash",
            "intId": 0,
            "user": {
                "id": 0,
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
        const currency = this.getOfferCurrency();
        let offer = this.getOfferTemplate();
        let price = helpfunc_f.helpFunctions.fromRUB(this.prices[itemID], currency);

        if (this.prices[itemID] === 0 || this.prices[itemID] === 1)
        {
            // don't add quest and unusual items
            return;
        }

        // todo: assign random item condition

        // common properties
        price = Math.round(price * this.getOfferPriceMultiplier());
        offer._id = common_f.hash.generate();
        offer.root = itemID;
        offer.items[0]._id = itemID;
        offer.items[0]._tpl = itemID;
        offer.items[0].upd.StackObjectsCount = this.getOfferStackSize();
        offer.requirements[0] = {
            "count": price,
            "_tpl": currency
        };
        offer.itemsCost = price;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        this.offers.push(offer);
    }

    createPresetOffer(presetID)
    {
        const currency = this.getOfferCurrency();
        const preset = common_f.json.clone(preset_f.controller.getPreset(presetID));
        let offer = this.getOfferTemplate();
        let mods = preset._items;
        let price = 0;

        // set root item id to preset
        mods[0]._id = preset._id;

        for (const it of mods)
        {
            // replace mod root parent with preset's id
            if (it.parentId && it.parentId === preset._parent)
            {
                it.parentId = preset._id;
            }

            // add mod to price
            price += helpfunc_f.helpFunctions.fromRUB(this.prices[it._tpl], currency);
        }

        // set stack size
        mods[0].upd = mods[0].upd || {};
        mods[0].upd.StackObjectsCount = 1;

        // preset offer
        offer.sellInOnePiece = true;

        // common properties
        price = Math.round(price * this.getOfferPriceMultiplier());
        offer._id = common_f.hash.generate();
        offer.root = preset._id;
        offer.items = mods;
        offer.requirements[0] = {
            "count": price,
            "_tpl": currency
        };
        offer.itemsCost = price;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        this.offers.push(offer);
    }

    // note: trader offer is static, so override time to use static time
    createTraderOffer(traderID, items, barterScheme, loyalLevel)
    {
        const trader = database_f.server.tables.traders[traderID].base;
        const price = this.getTraderItemPrice(barterScheme);
        let offer = this.getOfferTemplate();

        // set trader user
        offer.user = {
            "id": trader._id,
            "memberType": 4,
            "nickname": trader.surname,
            "isRatingGrowing": true,
            "avatar": trader.avatar
        };

        // use restock time
        offer.endTime = trader.supply_next_time;

        // common properties
        offer._id = items[0]._id;
        offer.root = items[0]._id;
        offer.items = items;
        offer.requirements = barterScheme;
        offer.loyaltyLevel = loyalLevel;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        this.offers.push(offer);
    }

    getOfferEndTime(timestamp)
    {
        let result = timestamp;

        // get time in minutes
        if (ragfair_f.config.dynamic.enabled)
        {
            result += common_f.random.getInt(ragfair_f.config.dynamic.timeMin, ragfair_f.config.dynamic.timeMax) * 60;
        }
        else
        {
            result += ragfair_f.config.static.time * 60;
        }

        return Math.round(result);
    }

    getOfferPriceMultiplier()
    {
        let result = 1;

        // get normalized value
        if (ragfair_f.config.dynamic.enabled)
        {
            result = common_f.random.getFloat(ragfair_f.config.dynamic.priceMin, ragfair_f.config.dynamic.priceMax);
        }
        else
        {
            result = ragfair_f.config.static.price;
        }
        
        return result;
    }

    getOfferStackSize()
    {
        let result = 1;

        // get stack size
        if (ragfair_f.config.dynamic.enabled)
        {
            result = common_f.random.getInt(ragfair_f.config.dynamic.stackMin, ragfair_f.config.dynamic.stackMax);   
        }
        else
        {
            result = ragfair_f.config.static.stack;
        }

        return Math.round(result);
    }

    getOfferCurrency()
    {
        if (ragfair_f.config.dynamic.enabled)
        {
            const currencies = ragfair_f.config.dynamic.currencies;
            let result = [];

            // weighten result
            for (let item in currencies)
            {
                for (let i = 0; i < currencies[item]; i++)
                {
                    result.push(item);
                }
            }

            return result[Math.floor(Math.random() * result.length)];
        }
        else
        {
            return ragfair_f.config.static.currency;
        }
    }

    getTraderItemPrice(barterScheme)
    {
        let price = 0;

        for (const barter of barterScheme)
        {
            price += (this.prices[barter._tpl] * barter.count);
        }

        return Math.round(price);
    }

    getItemPrices()
    {
        const items = database_f.server.tables.templates.items;
        let prices = {};

        for (const itemID in items)
        {
            prices[itemID] = Math.round(helpfunc_f.helpFunctions.getTemplatePrice(itemID));
        }

        this.prices = prices;
    }

    getOffer(offerID)
    {
        return this.offers.find((item) =>
        {
            return item._id === offerID;
        });
    }

    removeOfferStack(offerID, amount)
    {
        if (!ragfair_f.config.dynamic.enabled)
        {
            return;
        }

        // remove stack from offer
        for (const offer in this.offers)
        {
            if (this.offers[offer]._id === offerID)
            {
                // found offer
                this.offers[offer].items[0].upd.StackObjectsCount -= amount;
                break;
            }
        }
    }

    isExpired(offer, time)
    {
        return offer.endTime < time || offer.items[0].upd.StackObjectsCount < 1;
    }
}

module.exports.Server = Server;
