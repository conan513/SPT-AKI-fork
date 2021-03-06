"use strict";

require("../Lib.js");

class RagfairServer
{
    static toUpdate = {};
    static offers = [];
    static categories = {};
    static prices = {
        "trader": {},
        "dynamic": {}
    };

    static load()
    {
        RagfairServer.getItemPrices();
        RagfairServer.addTraders();
        RagfairServer.update();
    }

    static addPlayerOffers()
    {
        for (const sessionID in SaveServer.profiles)
        {
            const pmcData = SaveServer.profiles[sessionID].characters.pmc;

            if (pmcData.RagfairInfo === undefined || pmcData.RagfairInfo.offers === undefined)
            {
                // profile is wiped
                continue;
            }

            const profileOffers = pmcData.RagfairInfo.offers;
            for (const offer of profileOffers)
            {
                RagfairServer.offers.push(offer);
            }
        }
    }

    static addTraders()
    {
        for (const traderID in DatabaseServer.tables.traders)
        {
            RagfairServer.toUpdate[traderID] = RagfairConfig.traders[traderID] || false;
        }
    }

    static update()
    {
        // remove expired offers
        const time = TimeUtil.getTimestamp();

        for (const i in RagfairServer.offers)
        {
            const offer = RagfairServer.offers[i];

            if (RagfairServer.isExpired(offer, time))
            {
                // update trader if offers expired
                if (RagfairServer.isTrader(offer.user.id))
                {
                    RagfairServer.toUpdate[offer.user.id] = true;
                }

                // Players need their items returning, and maybe their XP adjusting
                if (RagfairServer.isPlayer(offer.user.id.replace(/^pmc/, "")))
                {
                    RagfairServer.returnPlayerOffer(offer);
                }

                // remove offer
                RagfairServer.offers.splice(i, 1);
            }
        }

        // generate trader offers
        for (const traderID in RagfairServer.toUpdate)
        {
            if (RagfairServer.toUpdate[traderID])
            {
                // trader offers expired or no offers found
                RagfairServer.generateTraderOffers(traderID);
                RagfairServer.toUpdate[traderID] = false;
            }
        }

        // generate dynamic offers
        if (RagfairConfig.dynamic.enabled && RagfairServer.offers.length < RagfairConfig.dynamic.threshold)
        {
            // offer count below threshold
            RagfairServer.generateDynamicOffers();
        }

        // set available categories
        for (const offer of RagfairServer.offers)
        {
            RagfairServer.categories[offer.items[0]._tpl] = 1;
        }
    }

    static generateTraderOffers(traderID)
    {
        // ensure old offers don't exist
        RagfairServer.offers = RagfairServer.offers.filter((offer) =>
        {
            return offer.user.id !== traderID;
        });

        // add trader offers
        const time = TimeUtil.getTimestamp();
        let assort = DatabaseServer.tables.traders[traderID].assort;

        if (traderID === "579dc571d53a0658a154fbec")
        {
            assort = TraderController.fenceAssort || { "items": [] };
        }

        for (const item of assort.items)
        {
            if (item.slotId !== "hideout")
            {
                // skip mod items
                continue;
            }

            const isPreset = PresetController.isPreset(item._id);
            const items = (isPreset) ? RagfairServer.getPresetItems(item) : [...[item], ...ItemHelper.findAndReturnChildrenByAssort(item._id, assort.items)];
            const barterScheme = assort.barter_scheme[item._id][0];
            const loyalLevel = assort.loyal_level_items[item._id];
            const price = RagfairServer.getBarterPrice(barterScheme);

            // create offer
            RagfairServer.createOffer(traderID, time, items, barterScheme, loyalLevel, price);
        }
    }

    static generateDynamicOffers()
    {
        const config = RagfairConfig.dynamic;
        const count = config.threshold + config.batchSize;
        const assort = JsonUtil.clone(DatabaseServer.tables.traders["ragfair"].assort);
        const assortItems = assort.items.filter((item) =>
        {
            return item.slotId === "hideout";
        });

        while (RagfairServer.offers.length < count)
        {
            // get base item and stack
            const item = RandomUtil.getArrayValue(assortItems);
            const isPreset = PresetController.isPreset(item._id);

            // create offer
            item.upd.StackObjectsCount = (isPreset) ? 1 : Math.round(RandomUtil.getInt(config.stack.min, config.stack.max));

            const userID = HashUtil.generate();
            const items = (isPreset) ? RagfairServer.getPresetItems(item) : [...[item], ...ItemHelper.findAndReturnChildrenByAssort(item._id, assort.items)];
            const barterScheme = RagfairServer.getOfferRequirements(items);
            const price = RagfairServer.getBarterPrice(barterScheme);

            RagfairServer.createOffer(
                userID,                                     // userID
                TimeUtil.getTimestamp(),                    // time
                items,                                      // items
                barterScheme,                               // barter scheme
                assort.loyal_level_items[item._id],         // loyal level
                price,                                      // price
                isPreset);                                  // sellAsOnePiece
        }
    }

    static createOffer(userID, time, items, barterScheme, loyalLevel, price, sellInOnePiece = false)
    {
        const isTrader = RagfairServer.isTrader(userID);
        const trader = DatabaseServer.tables.traders[(isTrader) ? userID : "ragfair"].base;

        // get properties
        items = RagfairServer.getItemCondition(userID, items);

        const offer = {
            "_id": (isTrader) ? items[0]._id : HashUtil.generate(),
            "intId": 0,
            "user": {
                "id": RagfairServer.getTraderId(userID),
                "memberType": (userID !== "ragfair") ? RagfairServer.getMemberType(userID) : 0,
                "nickname": RagfairServer.getNickname(userID),
                "rating": RagfairServer.getRating(userID),
                "isRatingGrowing": RagfairServer.getRatingGrowing(userID),
                "avatar": trader.avatar
            },
            "root": items[0]._id,
            "items": JsonUtil.clone(items),
            "requirements": barterScheme,
            "requirementsCost": price,
            "itemsCost": price,
            "summaryCost": price,
            "startTime": time,
            "endTime": RagfairServer.getOfferEndTime(userID, time),
            "loyaltyLevel": loyalLevel,
            "sellInOnePiece": sellInOnePiece,
            "priority": false
        };

        RagfairServer.offers.push(offer);
        return offer;
    }

    static getTraderId(userID)
    {
        if (RagfairServer.isPlayer(userID))
        {
            return SaveServer.profiles[userID].characters.pmc._id;
        }
        return userID;
    }

    static getMemberType(userID)
    {
        if (RagfairServer.isPlayer(userID))
        {
            // player offer
            return SaveServer.profiles[userID].characters.pmc.Info.AccountType;
        }

        if (RagfairServer.isTrader(userID))
        {
            // trader offer
            return 4;
        }

        // generated offer
        return 0;
    }

    static getNickname(userID)
    {
        if (RagfairServer.isPlayer(userID))
        {
            // player offer
            return SaveServer.profiles[userID].characters.pmc.Info.Nickname;
        }

        if (RagfairServer.isTrader(userID))
        {
            // trader offer
            return DatabaseServer.tables.traders[userID].base.nickname;
        }

        // generated offer
        // recurse if name is longer than max characters allowed (15 characters)
        const type = (RandomUtil.getInt(0, 1) === 0) ? "usec" : "bear";
        const name = RandomUtil.getArrayValue(DatabaseServer.tables.bots.types[type].firstName);
        return (name.length > 15) ? RagfairServer.getNickname(userID) : name;
    }

    static getOfferEndTime(userID, time)
    {
        if (RagfairServer.isPlayer(userID))
        {
            // player offer
            return TimeUtil.getTimestamp() + Math.round(12 * 3600);
        }

        if (RagfairServer.isTrader(userID))
        {
            // trader offer
            return DatabaseServer.tables.traders[userID].base.nextResupply;
        }

        // generated offer
        return Math.round(time + RandomUtil.getInt(RagfairConfig.dynamic.endTime.min, RagfairConfig.dynamic.endTime.max) * 60);
    }

    static getRating(userID)
    {
        if (RagfairServer.isPlayer(userID))
        {
            // player offer
            return SaveServer.profiles[userID].characters.pmc.RagfairInfo.rating;
        }

        if (RagfairServer.isTrader(userID))
        {
            // trader offer
            return 1;
        }

        // generated offer
        return RandomUtil.getFloat(RagfairConfig.dynamic.rating.min, RagfairConfig.dynamic.rating.max);
    }

    static getRatingGrowing(userID)
    {
        if (RagfairServer.isPlayer(userID))
        {
            // player offer
            return SaveServer.profiles[userID].characters.pmc.RagfairInfo.isRatingGrowing;
        }

        if (RagfairServer.isTrader(userID))
        {
            // trader offer
            return true;
        }

        // generated offer
        return RandomUtil.getBool();
    }

    static getItemCondition(userID, items)
    {
        const item = RagfairServer.addMissingCondition(items[0]);

        if (!RagfairServer.isPlayer(userID) && !RagfairServer.isTrader(userID))
        {
            const multiplier = RandomUtil.getFloat(RagfairConfig.dynamic.condition.min, RagfairConfig.dynamic.condition.max);

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

    static addMissingCondition(item)
    {
        const props = ItemHelper.getItem(item._tpl)[1]._props;
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

    static getDynamicOfferCurrency()
    {
        const currencies = RagfairConfig.dynamic.currencies;
        const bias = [];

        for (const item in currencies)
        {
            for (let i = 0; i < currencies[item]; i++)
            {
                bias.push(item);
            }
        }

        return bias[Math.floor(Math.random() * bias.length)];
    }

    static getDynamicOfferPrice(items, currency)
    {
        let price = 0;

        for (const it of items)
        {
            price += PaymentController.fromRUB(RagfairServer.prices.dynamic[it._tpl], currency) * ItemHelper.getItemQualityPrice(it);
        }

        price = Math.round(price * RandomUtil.getFloat(RagfairConfig.dynamic.price.min, RagfairConfig.dynamic.price.max));

        if (price < 1)
        {
            price = 1;
        }

        return price;
    }

    static getOfferRequirements(items)
    {
        const currency = RagfairServer.getDynamicOfferCurrency();
        const price = RagfairServer.getDynamicOfferPrice(items, currency);

        return [
            {
                "count": price,
                "_tpl": currency
            }
        ];
    }

    static getBarterPrice(barterScheme)
    {
        let price = 0;

        for (const item of barterScheme)
        {
            price += (RagfairServer.prices.trader[item._tpl] * item.count);
        }

        return Math.round(price);
    }

    static getItemPrices()
    {
        const items = DatabaseServer.tables.templates.items;
        const prices = DatabaseServer.tables.templates.prices;

        // trader offers
        for (const itemID in items)
        {
            RagfairServer.prices.trader[itemID] = Math.round(HandbookController.getTemplatePrice(itemID));
        }

        // dynamic offers
        const dynamic = (RagfairConfig.dynamic.liveprices) ? { ...RagfairServer.prices.trader, ...prices } : RagfairServer.prices.trader;

        for (const itemID in dynamic)
        {
            dynamic[itemID] = dynamic[itemID] || 1;
        }

        RagfairServer.prices.dynamic = dynamic;
    }

    static getOffer(offerID)
    {
        return JsonUtil.clone(RagfairServer.offers.find((item) =>
        {
            return item._id === offerID;
        }));
    }

    static getPresetItems(item)
    {
        const preset = JsonUtil.clone(DatabaseServer.tables.globals.ItemPresets[item._id]._items);
        return RagfairServer.reparentPresets(item, preset);
    }

    static getPresetItemsByTpl(item)
    {
        const presets = [];

        for (const itemId in DatabaseServer.tables.globals.ItemPresets)
        {
            if (DatabaseServer.tables.globals.ItemPresets[itemId]._items[0]._tpl === item._tpl)
            {
                const preset = JsonUtil.clone(DatabaseServer.tables.globals.ItemPresets[itemId]._items);
                presets.push(RagfairServer.reparentPresets(item, preset));
            }
        }

        return presets;
    }

    static reparentPresets(item, preset)
    {
        const oldRootId = preset[0]._id;
        const idMappings = {};

        idMappings[oldRootId] = item._id;

        for (const mod of preset)
        {
            if (idMappings[mod._id] === undefined)
            {
                idMappings[mod._id] = HashUtil.generate();
            }

            if (mod.parentId !== undefined && idMappings[mod.parentId] === undefined)
            {
                idMappings[mod.parentId] = HashUtil.generate();
            }

            mod._id =  idMappings[mod._id];

            if (mod.parentId !== undefined)
            {
                mod.parentId =  idMappings[mod.parentId];
            }
        }

        preset[0] = item;
        return preset;
    }

    static returnPlayerOffer(offer)
    {
        const pmcID = String(offer.user.id);
        const profile = ProfileController.getProfileByPmcId(pmcID);
        const sessionID = profile.aid;
        const index = profile.RagfairInfo.offers.findIndex(o => o._id === offer._id);

        profile.RagfairInfo.rating -= RagfairConfig.sell.reputation.loss;
        profile.RagfairInfo.isRatingGrowing = false;

        if (index === -1)
        {
            Logger.warning(`Could not find offer to remove with offerId -> ${offer._id}`);
            return HttpResponse.appendErrorToOutput(ItemEventRouter.getOutput(sessionID), "Offer not found in profile");
        }

        if (offer.items[0].upd.StackObjectsCount > offer.items[0].upd.OriginalStackObjectsCount)
        {
            offer.items[0].upd.StackObjectsCount = offer.items[0].upd.OriginalStackObjectsCount;
        }
        delete offer.items[0].upd.OriginalStackObjectsCount;

        RagfairController.returnItems(profile.aid, offer.items);
        profile.RagfairInfo.offers.splice(index, 1);
        RagfairServer.offers.splice(RagfairServer.offers.findIndex(o => o._id === offer._id), 1);

        return ItemEventRouter.getOutput(sessionID);
    }

    static removeOfferStack(offerID, amount)
    {
        if (!RagfairConfig.dynamic.enabled)
        {
            return;
        }

        // remove stack from offer
        for (const offer in RagfairServer.offers)
        {
            if (RagfairServer.offers[offer]._id === offerID)
            {
                // found offer
                RagfairServer.offers[offer].items[0].upd.StackObjectsCount -= amount;
                break;
            }
        }
    }

    static isExpired(offer, time)
    {
        return offer.endTime < time || offer.items[0].upd.StackObjectsCount < 1;
    }

    static isTrader(userID)
    {
        return userID in DatabaseServer.tables.traders;
    }

    static isPlayer(userID)
    {
        if (ProfileController.getPmcProfile(userID) !== undefined)
        {
            return true;
        }
        return false;
    }
}

module.exports = RagfairServer;
