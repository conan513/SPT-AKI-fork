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
                // skip trader except ragfair when trader is disabled
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

    createOffer(userID, time, items, barterScheme, loyalLevel)
    {
        const isTrader = userID in database_f.server.tables.traders;
        const trader = database_f.server.tables.traders[(isTrader) ? userID : "ragfair"].base;
        const price = this.getTraderItemPrice(barterScheme);

        // todo: assign random item condition
        let offer = {
            "_id": (isTrader) ? items[0]._id : common_f.hash.generate(),
            "intId": 0,
            "user": {
                "id": userID,
                "memberType": this.getMemberType(userID),
                "nickname": this.getNickname(userID),
                "rating": 100,
                "isRatingGrowing": true,
                "avatar": trader.avatar
            },
            "root": items[0]._id,
            "items": items,
            "requirements": barterScheme,
            "requirementsCost": price,
            "itemsCost": price,
            "summaryCost": price,
            "startTime": time,
            "endTime": (isTrader) ? trader.supply_next_time : this.getOfferEndTime(time),
            "loyaltyLevel": loyalLevel,
            "sellInOnePiece": preset_f.controller.isPreset(items[0]._id),
            "priority": false
        };

        this.offers.push(offer);
    }

    getMemberType(userID)
    {
        if (userID in save_f.server.profiles)
        {
            // player offer
            return save_f.server.profiles.characters.pmc.Info.AccountType;
        }
        
        if (userID in database_f.server.tables.traders)
        {
            // trader offer
            return 4;
        }
        
        // generated offer
        return 0;
    }

    getNickname(userID)
    {
        if (userID in save_f.server.profiles)
        {
            // player offer
            return save_f.server.profiles.characters.pmc.Info.Nickname;
        }
        
        if (userID in database_f.server.tables.traders)
        {
            // trader offer
            return database_f.server.tables.traders[userID].base.nickname;
        }
        
        // generated offer
        return "Unknown";
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
