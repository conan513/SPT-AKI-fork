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
        this.toUpdate = {};
        this.offers = [];
        this.categories = {};
        this.prices = {
            "trader": {},
            "dynamic": {}
        };
    }

    load()
    {
        this.getItemPrices();
        this.addTraders();
        this.addPlayerOffers();
        this.update();
    }

    addPlayerOffers()
    {
        for (const sessionID in save_f.server.profiles)
        {
            const pmcData = save_f.server.profiles[sessionID].characters.pmc;

            if (!("RagfairInfo" in pmcData))
            {
                // profile is wiped
                continue;
            }

            const profileOffers = pmcData.RagfairInfo.offers;

            if (profileOffers && profileOffers.length)
            {
                // no offers
                continue;
            }

            for (const offer of profileOffers)
            {
                this.offers.push(offer);
            }
        }
    }

    addTraders()
    {
        for (const traderID in database_f.server.tables.traders)
        {
            this.toUpdate[traderID] = true;
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

                // Players need their items returning, and maybe their XP adjusting
                if (this.isPlayer(offer.user.id))
                {
                    this.returnPlayerOffer(offer._id, sessionID);
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
            // get base item and stack
            let item = common_f.random.getArrayValue(assortItems);
            const isPreset = preset_f.controller.isPreset(item._id);

            item.upd.StackObjectsCount = (isPreset) ? 1 : Math.round(common_f.random.getInt(config.stack.min, config.stack.max));

            // create offer
            const items = (isPreset) ? this.getPresetItems(item) : [...[item], ...helpfunc_f.helpFunctions.findAndReturnChildrenByAssort(item._id, assort.items)];

            this.createOffer(
                common_f.hash.generate(),           // userID
                common_f.time.getTimestamp(),       // time
                items,                              // items
                this.getOfferRequirements(items),   // barter scheme
                assort.loyal_level_items[item._id], // loyal level
                isPreset);                          // sellAsOnePiece
        }
    }

    createOffer(userID, time, items, barterScheme, loyalLevel, sellInOnePiece = false, price = null)
    {
        const isTrader = this.isTrader(userID);
        const trader = database_f.server.tables.traders[(isTrader) ? userID : "ragfair"].base;
        
        if (price === null)
        {
            price = this.getBarterPrice(userID, barterScheme);
        }

        // remove properties
        delete items[0].upd.UnlimitedCount;

        // get properties
        items = this.getItemCondition(userID, items);
        price = (this.isPlayer(userID) || this.isTrader(userID)) ? price : Math.round(price * helpfunc_f.helpFunctions.getItemQualityPrice(items[0]));

        // user.id = profile.characters.pmc._id??
        let offer = {
            "_id": (isTrader) ? items[0]._id : common_f.hash.generate(),
            "intId": 0,
            "user": {
                "id": this.getTraderId(userID),
                "memberType": (userID !== "ragfair") ? this.getMemberType(userID) : 0,
                "nickname": this.getNickname(userID),
                "rating": this.getRating(userID),
                "isRatingGrowing": this.getRatingGrowing(userID),
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
            "sellInOnePiece": sellInOnePiece,
            "priority": false
        };

        this.offers.push(offer);
        return offer;
    }

    getTraderId(userID)
    {
        if (this.isPlayer(userID))
        {
            return save_f.server.profiles[userID].characters.pmc._id;
        }
        return userID;
    }

    getMemberType(userID)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return save_f.server.profiles[userID].characters.pmc.Info.AccountType;
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
            return save_f.server.profiles[userID].characters.pmc.Info.Nickname;
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return database_f.server.tables.traders[userID].base.nickname;
        }

        // generated offer
        // recurse if name is longer than max characters allowed (15 characters)
        const type = (common_f.random.getInt(0, 1) === 0) ? "usec" : "bear";
        const name = common_f.random.getArrayValue(database_f.server.tables.bots.types[type].names);
        return (name.length > 15) ? this.getNickname(userID) : name;
    }

    getOfferEndTime(userID, time)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return common_f.time.getTimestamp() + Math.round(ragfair_f.config.player.sellTimeHrs * 3600);
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return database_f.server.tables.traders[userID].base.supply_next_time;
        }

        // generated offer
        return Math.round(time + common_f.random.getInt(ragfair_f.config.dynamic.endTime.min, ragfair_f.config.dynamic.endTime.max) * 60);
    }

    getRating(userID)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return save_f.server.profiles[userID].characters.pmc.RagfairInfo.rating;
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return 1;
        }

        // generated offer
        return common_f.random.getFloat(ragfair_f.config.dynamic.rating.min, ragfair_f.config.dynamic.rating.max);
    }

    getRatingGrowing(userID)
    {
        if (this.isPlayer(userID))
        {
            // player offer
            return save_f.server.profiles[userID].characters.pmc.RagfairInfo.isRatingGrowing;
        }

        if (this.isTrader(userID))
        {
            // trader offer
            return true;
        }

        // generated offer
        return common_f.random.getBool();
    }

    getItemCondition(userID, items)
    {
        let item = this.addMissingCondition(items[0]);

        if (!this.isPlayer(userID) && !this.isTrader(userID))
        {
            const multiplier = common_f.random.getFloat(ragfair_f.config.dynamic.condition.min, ragfair_f.config.dynamic.condition.max);

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

    getDynamicOfferCurrency()
    {
        const currencies = ragfair_f.config.dynamic.currencies;
        let bias = [];

        for (let item in currencies)
        {
            for (let i = 0; i < currencies[item]; i++)
            {
                bias.push(item);
            }
        }

        return bias[Math.floor(Math.random() * bias.length)];
    }

    getDynamicOfferPrice(items, currency)
    {
        let price = 0;

        for (const it of items)
        {
            price += helpfunc_f.helpFunctions.fromRUB(this.prices.dynamic[it._tpl], currency);
        }

        return Math.round(price * common_f.random.getFloat(ragfair_f.config.dynamic.price.min, ragfair_f.config.dynamic.price.max));
    }

    getOfferRequirements(items)
    {
        const currency = this.getDynamicOfferCurrency();
        const price = this.getDynamicOfferPrice(items, currency);

        return [
            {
                "count": price,
                "_tpl": currency
            }
        ];
    }

    getBarterPrice(userID, barterScheme)
    {
        let price = 0;

        for (const item of barterScheme)
        {
            price += (this.isTrader(userID)) ? (this.prices.trader[item._tpl] * item.count) : (this.prices.dynamic[item._tpl] * item.count);
        }

        return Math.round(price);
    }

    getItemPrices()
    {
        const items = database_f.server.tables.templates.items;
        const prices = database_f.server.tables.templates.prices;

        // trader offers
        for (const itemID in items)
        {
            this.prices.trader[itemID] = Math.round(helpfunc_f.helpFunctions.getTemplatePrice(itemID));
        }

        // dynamic offers
        this.prices.dynamic = (ragfair_f.config.dynamic.liveprices) ? {...this.prices.trader, ...prices} : this.prices.trader;
    }

    getOffer(offerID)
    {
        return common_f.json.clone(this.offers.find((item) =>
        {
            return item._id === offerID;
        }));
    }

    getPresetItems(item)
    {
        const preset = common_f.json.clone(database_f.server.tables.globals.ItemPresets[item._id]._items);
        preset[0].parentId = item.parentId;
        preset[0].slotId = item.slotId;
        preset[0].upd = item.upd;
        return preset;
    }

    returnPlayerOffer(offerId, sessionID)
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
        ragfair_f.controller.returnItems(sessionID, itemsToReturn);
        offers.splice(index, 1);

        return item_f.eventHandler.getOutput();
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
