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
        this.toUpdate = {};
    }

    load()
    {
        this.getItemPrices();
        this.addTraders();
        this.update();
    }

    addTraders()
    {
        for (const traderID in database_f.server.tables.traders)
        {
            this.toUpdate[traderID] = true;

            if (traderID !== "ragfair" && !ragfair_f.config.static.traders[traderID])
            {
                // skip trader except ragfair when trader is disabled
                this.toUpdate[traderID] = false;
            }

            if (traderID === "ragfair" && !ragfair_f.config.static.unknown)
            {
                // skip ragfair when unknown is disabled
                this.toUpdate[traderID] = false;
            }
        }
    }

    // todo: move player offer code here
    update()
    {
        // remove expired offers
        const time = common_f.time.getTimestamp();

        for (const i in this.offers)
        {
            const offer = this.offers[i];

            if (this.isExpired(offer, time))
            {
                // update trader if offers expired
                if (this.isTrader(offer.user.id))
                {
                    this.toUpdate[offer.user.id] = true;
                }

                // remove offer
                this.offers.splice(i, 1);
            }
        }

        // generate trader offers
        for (const traderID in this.toUpdate)
        {
            if (this.toUpdate[traderID])
            {
                // trader offers expired or no offers found
                this.generateTraderOffers(traderID);
                this.toUpdate[traderID] = false;
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
        const time = common_f.time.getTimestamp();
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
        const config = ragfair_f.config.dynamic;
        const count = config.threshold + config.batchSize;
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
            const loyalLevel = assort.loyal_level_items[item._id];
            let items = [...[item], ...helpfunc_f.helpFunctions.findAndReturnChildrenByAssort(item._id, assort.items)];
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

            // randomize values
            items[0].upd.StackObjectsCount = Math.round(common_f.random.getInt(config.stackMin, config.stackMax));
            barterScheme[0].count *= common_f.random.getFloat(config.priceMin, config.priceMax);

            // remove properties
            delete items[0].parentId;
            delete items[0].slotId;
            delete items[0].upd.UnlimitedCount;

            // create offer
            this.createOffer(userID, time, items, barterScheme, loyalLevel);
        }
    }

    createOffer(userID, time, items, barterScheme, loyalLevel)
    {
        const isTrader = this.isTrader(userID);
        const trader = database_f.server.tables.traders[(isTrader) ? userID : "ragfair"].base;
        let price = this.getOfferPrice(barterScheme);

        items = this.getItemCondition(userID, items);
        price = (this.isPlayer(userID)) ? price : Math.round(price * helpfunc_f.helpFunctions.getItemQualityPrice(items[0]));

        let offer = {
            "_id": (isTrader) ? items[0]._id : common_f.hash.generate(),
            "intId": 0,
            "user": {
                "id": userID,
                "memberType": (userID !== "ragfair") ? this.getMemberType(userID) : 0,
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
            "endTime": this.getOfferEndTime(userID, time),
            "loyaltyLevel": loyalLevel,
            "sellInOnePiece": false,
            "priority": false
        };

        this.offers.push(offer);
    }

    getMemberType(userID)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return save_f.server.profiles.characters.pmc.Info.AccountType;
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return 4;
        }

        // generated offer
        return 0;
    }

    getNickname(userID)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return save_f.server.profiles.characters.pmc.Info.Nickname;
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return database_f.server.tables.traders[userID].base.nickname;
        }

        // generated offer
        const type = (common_f.random.getInt(0, 1) === 0) ? "usec" : "bear";
        return common_f.random.getArrayValue(database_f.server.tables.bots.types[type].names);
    }

    getOfferEndTime(userID, time)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return save_f.server.profiles.characters.pmc.Info.Nickname;
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return database_f.server.tables.traders[userID].base.supply_next_time;
        }

        // generated offer
        return Math.round(time + common_f.random.getInt(ragfair_f.config.dynamic.timeEndMin, ragfair_f.config.dynamic.timeEndMax) * 60);
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

    getItemCondition(userID, items)
    {
        let item = this.addMissingCondition(items[0]);
        
        if (!this.isPlayer(userID) && !this.isTrader(userID))
        {
            const multiplier = common_f.random.getFloat(ragfair_f.config.dynamic.conditionMin, ragfair_f.config.dynamic.conditionMax);

            if ("Repairable" in item.upd)
            {
                // randomize durability
                item.upd.Repairable.Durability = Math.round(item.upd.Repairable.Durability * multiplier) || 1;
            }

            if ("MedKit" in item.upd)
            {
                // randomize health
                item.upd.MedKit.HpResource = Math.round(item.upd.MedKit.HpResource * multiplier) || 1;
            }
        }
        
        items[0] = item;
        return items;
    }

    addMissingCondition(item)
    {
        const props = helpfunc_f.helpFunctions.getItem(item._tpl)[1]._props;
        const isRepairable = ("Durability" in props);
        const isMedkit = ("MaxHpResource" in props);

        if (isRepairable && props.Durability > 0)
        {
            item.upd.Repairable = {
                "Durability": props.Durability,
                "MaxDurability": props.Durability
            };
        }

        if (isMedkit && props.MaxHpResource > 0)
        {
            item.upd.MedKit = {
                "HpResource": props.MaxHpResource,
            };
        }

        return item;
    }

    getOfferPrice(barterScheme)
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

        for (const itemID in items)
        {
            this.prices[itemID] = Math.round(helpfunc_f.helpFunctions.getTemplatePrice(itemID));
        }
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

    isTrader(userID)
    {
        return userID in database_f.server.tables.traders;
    }

    isPlayer(userID)
    {
        return userID in save_f.server.profiles;
    }
}

module.exports.Server = Server;
