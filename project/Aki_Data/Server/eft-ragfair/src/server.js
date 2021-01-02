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
        let toUpdate = {};

        for (const i in this.offers)
        {
            if (this.isExpired(this.offers[i], time))
            {
                // update trader if offers expired
                if (this.offers[i].user.memberType === 4)
                {
                    toUpdate[this.offers[i].user.id] = 1;
                }

                // remove offer
                this.offers.splice(i, 1);
            }
        }

        // generate new offers
        for (const traderID in database_f.server.tables.traders)
        {
            if (traderID in toUpdate || !this.offers.find((offer) => { return offer.user.id === traderID; }))
            {
                // trader offers expired or no offers found
                this.generateTraderOffers(traderID);
            }
        }

        if (ragfair_f.config.dynamic.enabled && this.offers.length < ragfair_f.config.dynamic.threshold)
        {
            // offer count below threshold
            this.generateDynamicOffers();
        }

        // set available categories
        for (const offer of this.offers)
        {
            this.categories[offer.items[0]._tpl] = 1;
        }
    }

    generateTraderOffers(traderID)
    {
        if (traderID === "579dc571d53a0658a154fbec")
        {
            // skip fence
            return;
        }

        if (traderID === "ragfair" && ragfair_f.config.dynamic.enabled)
        {
            // skip ragfair on dynamic mode
            return;
        }

        // ensure old offers don't exist
        this.offers = this.offers.filter((offer) =>
        {
            return offer.user.id !== traderID;
        });

        // add trader offers
        const time = common_f.time.getTimestamp()
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

            this.createTraderOffer(traderID, time, items, barterScheme, loyalLevel);
        }
    }

    generateDynamicOffers(time)
    {
        const count = ragfair_f.config.dynamic.threshold + ragfair_f.config.dynamic.batchSize;
        const presets = Object.keys(database_f.server.tables.globals.ItemPresets);
        const items = Object.keys(database_f.server.tables.templates.items).filter((item) =>
        {
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

    getOfferTemplate()
    {
        return {
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
            "startTime": 0,
            "endTime": 0,
            "loyaltyLevel": 1,
            "sellInOnePiece": false,
            "priority": false
        };
    }

    createItemOffer(itemID, time = 0)
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
        offer.requirementsCost = helpfunc_f.helpFunctions.inRUB(price, currency);
        offer.summaryCost = price;
        offer.startTime = time || common_f.time.getTimestamp();
        offer.endTime = this.getOfferEndTime(offer.startTime);

        this.offers.push(offer);
    }

    createPresetOffer(presetID, time = 0)
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
        offer.requirementsCost = helpfunc_f.helpFunctions.inRUB(price, currency);
        offer.summaryCost = price;
        offer.startTime = time || common_f.time.getTimestamp();
        offer.endTime = this.getOfferEndTime(offer.startTime);

        this.offers.push(offer);
    }

    // note: trader offer is static, so override time to use static time
    createTraderOffer(traderID, time, items, barterScheme, loyalLevel)
    {
        const trader = database_f.server.tables.traders[traderID].base;
        const price = this.getTraderItemPrice(barterScheme);
        let offer = this.getOfferTemplate();

        // set trader user
        offer.user = {
            "id": trader._id,
            "memberType": 4,
            "nickname": (trader.surname === "ragfair") ? "Unknown" : trader.surname,
            "isRatingGrowing": true,
            "avatar": trader.avatar
        };

        // common properties
        offer._id = items[0]._id;
        offer.root = items[0]._id;
        offer.items = items;
        offer.requirements = barterScheme;
        offer.loyaltyLevel = loyalLevel;
        offer.requirementsCost = price;
        offer.summaryCost = price;
        offer.startTime = time;
        offer.endTime = trader.supply_next_time;

        this.offers.push(offer);
    }

    getOfferEndTime(timestamp)
    {
        let result = timestamp || common_f.time.getTimestamp();

        // get time in minutes
        if (ragfair_f.config.dynamic.enabled)
        {
            result += common_f.random.getInt(ragfair_f.config.dynamic.timeEndMin, ragfair_f.config.dynamic.timeEndMax) * 60;
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
