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

        // generate trader offers
        for (const traderID in database_f.server.tables.traders)
        {
            if (traderID !== "ragfair" && !ragfair_f.config.static.traders[traderID])
            {
                // skip all traders except ragfair when traders are disabled
                continue;
            }

            if (traderID === "ragfair" && !ragfair_f.config.static.unknown)
            {
                // skip ragfair when unknown is disabled
                continue;
            }

            if (traderID in toUpdate || !this.offers.find((offer) => { return offer.user.id === traderID; }))
            {
                // trader offers expired or no offers found
                this.generateTraderOffers(traderID);
            }
        }

        // generate dynamic offers
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
                // skip mod items
                continue;
            }

            const items = [...[item], ...helpfunc_f.helpFunctions.findAndReturnChildrenByAssort(item._id, assort.items)];
            const barterScheme = assort.barter_scheme[item._id][0];
            const loyalLevel = assort.loyal_level_items[item._id];

            // create offer
            this.createOffer(traderID, time, items, barterScheme, loyalLevel);
        }
    }

    generateDynamicOffers()
    {
        const count = ragfair_f.config.dynamic.threshold + ragfair_f.config.dynamic.batchSize;
        const assort = common_f.json.clone(database_f.server.tables.traders["ragfair"].assort);
        const assortItems = assort.items.filter((item) =>
        {
            return item.slotId === "hideout";
        });

        while (this.offers.length < count)
        {
            const userID = common_f.hash.generate();
            const time = common_f.time.getTimestamp();
            const item = common_f.random.getArrayValue(assortItems);
            const items = [...[item], ...helpfunc_f.helpFunctions.findAndReturnChildrenByAssort(item._id, assort.items)];
            const loyalLevel = assort.loyal_level_items[item._id];
            let barterScheme = [
                {
                    "count": 0,
                    "_tpl": this.getOfferCurrency()
                }
            ];

            // get price
            for (const it of items)
            {
                barterScheme[0].count += helpfunc_f.helpFunctions.fromRUB(this.prices[it._tpl], barterScheme[0]._tpl);
            }

            // create offer
            this.createOffer(userID, time, items, barterScheme, loyalLevel);
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
    createOffer(userID, time, items, barterScheme, loyalLevel)
    {
        const traderID = (userID !== "ragfair" && userID in database_f.server.tables.traders) ? userID : "ragfair";
        const trader = database_f.server.tables.traders[traderID].base;
        const price = this.getTraderItemPrice(barterScheme);
        const memberType = this.getMemberType(userID);

        let offer = this.getOfferTemplate();

        // todo: assign random item condition

        // set trader user
        offer.user = {
            "id": userID,
            "memberType": memberType,
            "nickname": trader.nickname,
            "rating": 100,
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
        offer.endTime = (traderID !== "ragfair") ? trader.supply_next_time : this.getOfferEndTime(offer.startTime);

        // temp fix
        if (!preset_f.controller.isPreset(offer._id))
        {
            // todo: fix presets
            this.offers.push(offer);
        }
        else
        {
            this.createPresetOffer(offer._id);
        }
    }

    getMemberType(userID)
    {
        if (userID in save_f.server.profiles)
        {
            // player offer
            return save_f.server.profiles.characters.pmc.Info.AccountType;
        }
        
        if (userID !== "ragfair" && userID in database_f.server.tables.traders)
        {
            // trader offer
            return 4;
        }
        
        // generated offer
        return 0;
    }

    getOfferEndTime(timestamp)
    {
        let result = timestamp || common_f.time.getTimestamp();

        // get time in minutes
        result += common_f.random.getInt(ragfair_f.config.dynamic.timeEndMin, ragfair_f.config.dynamic.timeEndMax) * 60;
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

        return result;
    }

    getOfferStackSize()
    {
        let result = 1;

        // get stack size
        result = common_f.random.getInt(ragfair_f.config.dynamic.stackMin, ragfair_f.config.dynamic.stackMax);
        return Math.round(result);
    }

    getOfferCurrency()
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
