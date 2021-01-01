/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 * - Terkoiz
 */

"use strict";

class Server
{
    constructor()
    {
        this.offers = [];
        this.categories = {};
    }

    load()
    {
        this.generateOffers();
    }

    generateOffers()
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

        // traders
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

        // categories
        for (const offer of this.offers)
        {
            this.categories[offer.items[0]._tpl] = 1;
        }
    }

    getOfferTemplate()
    {
        const time = common_f.time.getTimestamp();
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
                        "StackObjectsCount": 999999999
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
            "startTime": time,
            "endTime": time + (7 * 24 * 60 * 60),
            "loyaltyLevel": 1,
            "sellInOnePiece": false,
            "priority": false
        }

        return offer;
    }

    createItemOffer(itemID)
    {
        const item = database_f.server.tables.templates.items[itemID];

        if (!item || item._type === "Node")
        {
            // don't add nodes
            return;
        }

        const price = ragfair_f.controller.fetchItemFleaPrice(itemID);

        if (price === 0 || price === 1)
        {
            // don't add quest items
            return;
        }

        let offer = this.getOfferTemplate();

        offer._id = itemID;
        offer.items[0]._tpl = itemID;
        offer.requirements[0].count = price;
        offer.itemsCost = price;
        offer.requirementsCost = price;
        offer.summaryCost = price;

        this.offers.push(offer);
    }

    createPresetOffer(presetID)
    {
        if (!preset_f.controller.isPreset(presetID))
        {
            return;
        }

        const preset = preset_f.controller.getPreset(presetID);
        let offer = this.getOfferTemplate();
        let mods = preset._items;
        let price = 0;

        for (const it of mods)
        {
            price += Math.round(helpfunc_f.helpFunctions.getTemplatePrice(it._tpl));
        }

        mods[0].upd = mods[0].upd || {}; // append the stack count
        mods[0].upd.StackObjectsCount = offer.items[0].upd.StackObjectsCount;

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
        const price = ragfair_f.controller.calculateCost(barterScheme);
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

        this.offers.push(offer);
    }
}

module.exports.Server = Server;
