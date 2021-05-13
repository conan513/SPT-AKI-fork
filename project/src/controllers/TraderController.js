"use strict";

require("../Lib.js");

class TraderController
{
    static fenceAssort = undefined;

    static load()
    {
        TraderController.updateTraders();
    }

    static getTrader(traderID, sessionID)
    {
        let pmcData = ProfileController.getPmcProfile(sessionID);
        let trader = DatabaseServer.tables.traders[traderID].base;

        if (!(traderID in pmcData.TraderStandings))
        {
            ProfileController.resetTrader(sessionID, traderID);
            TraderController.lvlUp(traderID, sessionID);
        }

        trader.loyalty.currentLevel = pmcData.TraderStandings[traderID].currentLevel;
        trader.loyalty.currentStanding = pmcData.TraderStandings[traderID].currentStanding.toFixed(3);
        trader.loyalty.currentSalesSum = pmcData.TraderStandings[traderID].currentSalesSum;
        trader.display = pmcData.TraderStandings[traderID].display;

        return trader;
    }

    static changeTraderDisplay(traderID, status, sessionID)
    {
        let pmcData = ProfileController.getPmcProfile(sessionID);
        pmcData.TraderStandings[traderID].display = status;
    }

    static getAllTraders(sessionID)
    {
        let traders = [];

        for (let traderID in DatabaseServer.tables.traders)
        {
            if (!DatabaseServer.tables.traders[traderID].base.working)
            {
                continue;
            }

            traders.push(TraderController.getTrader(traderID, sessionID));
        }

        return traders;
    }

    static lvlUp(traderID, sessionID)
    {
        let pmcData = ProfileController.getPmcProfile(sessionID);
        let loyaltyLevels = DatabaseServer.tables.traders[traderID].base.loyalty.loyaltyLevels;

        // level up player
        pmcData.Info.Level = PlzRefactorMeHelper.calculateLevel(pmcData);

        // level up traders
        let targetLevel = 0;

        for (let level in loyaltyLevels)
        {
            if ((loyaltyLevels[level].minLevel <= pmcData.Info.Level
                && loyaltyLevels[level].minSalesSum <= pmcData.TraderStandings[traderID].currentSalesSum
                && loyaltyLevels[level].minStanding <= pmcData.TraderStandings[traderID].currentStanding)
                && targetLevel < 4)
            {
                // level reached
                targetLevel++;
            }
        }

        // set level
        pmcData.TraderStandings[traderID].currentLevel = targetLevel;
        DatabaseServer.tables.traders[traderID].base.loyalty.currentLevel = targetLevel;
    }

    static updateTraders()
    {
        const time = TimeUtil.getTimestamp();
        const update = TraderConfig.updateTime;

        for (const traderID in DatabaseServer.tables.traders)
        {
            const trader = DatabaseServer.tables.traders[traderID].base;

            if (trader.supply_next_time > time)
            {
                continue;
            }

            // get resupply time
            const overdue = (time - trader.supply_next_time);
            const refresh = Math.floor(overdue / update) + 1;

            trader.supply_next_time = trader.supply_next_time + refresh * update;
            DatabaseServer.tables.traders[traderID].base = trader;
        }

        return true;
    }

    static getAssort(sessionID, traderID)
    {
        if (traderID === "579dc571d53a0658a154fbec")
        {
            const time = TimeUtil.getTimestamp();
            const trader = DatabaseServer.tables.traders[traderID].base;

            if (!TraderController.fenceAssort || trader.supply_next_time < time)
            {
                Logger.warning("generating fence");
                TraderController.fenceAssort = TraderController.generateFenceAssort();
                RagfairServer.generateTraderOffers(traderID);
            }

            return TraderController.fenceAssort;
        }

        const pmcData = ProfileController.getPmcProfile(sessionID);
        const traderData = JsonUtil.clone(DatabaseServer.tables.traders[traderID]);
        let result = traderData.assort;

        // strip items (1 is min level, 4 is max level)
        for (const itemID in result.loyal_level_items)
        {
            if (result.loyal_level_items[itemID] > pmcData.TraderStandings[traderID].currentLevel)
            {
                result = TraderController.removeItemFromAssort(result, itemID);
            }
        }

        // strip quest result
        if ("questassort" in traderData)
        {
            const questassort = DatabaseServer.tables.traders[traderID].questassort;

            for (const itemID in result.loyal_level_items)
            {
                if (itemID in questassort.started && QuestController.questStatus(pmcData, questassort.started[itemID]) !== "Started")
                {
                    result = TraderController.removeItemFromAssort(result, itemID);
                }

                if (itemID in questassort.success && QuestController.questStatus(pmcData, questassort.success[itemID]) !== "Success")
                {
                    result = TraderController.removeItemFromAssort(result, itemID);
                }

                if (itemID in questassort.fail && QuestController.questStatus(pmcData, questassort.fail[itemID]) !== "Fail")
                {
                    result = TraderController.removeItemFromAssort(result, itemID);
                }
            }
        }

        return result;
    }

    static generateFenceAssort()
    {
        const fenceID = "579dc571d53a0658a154fbec";
        const assort = DatabaseServer.tables.traders[fenceID].assort;
        const itemPresets = DatabaseServer.tables.globals.ItemPresets;
        const names = Object.keys(assort.loyal_level_items);
        let result = {
            "items": [],
            "barter_scheme": {},
            "loyal_level_items": {}
        };

        for (let i = 0; i < TraderConfig.fenceAssortSize; i++)
        {
            let itemID = names[RandomUtil.getInt(0, names.length - 1)];
            let price = HandbookController.getTemplatePrice(itemID);

            if (price === 0 || price === 1 || price === 100)
            {
                // don't allow "special" items
                i--;
                continue;
            }

            // it's the item
            if (!(itemID in itemPresets))
            {
                const toPush = JsonUtil.clone(assort.items[assort.items.findIndex(i => i._id === itemID)]);
                toPush._id = HashUtil.generate();
                result.items.push(toPush);
                result.barter_scheme[toPush._id] = assort.barter_scheme[itemID];
                result.loyal_level_items[toPush._id] = assort.loyal_level_items[itemID];
                continue;
            }

            // it's itemPreset
            let rub = 0;
            let items = JsonUtil.clone(itemPresets[itemID]._items);
            let ItemRootOldId = itemPresets[itemID]._parent;

            items[0]._id = HashUtil.generate();

            for (let i = 0; i < items.length; i++)
            {
                let mod = items[i];

                //build root Item info
                if (!("parentId" in mod))
                {
                    mod._id = items[0]._id;
                    mod.parentId = "hideout";
                    mod.slotId = "hideout";
                    mod.upd = {
                        "UnlimitedCount": true,
                        "StackObjectsCount": 999999999
                    };
                }
                else if (mod.parentId === ItemRootOldId)
                {
                    mod.parentId = items[0]._id;
                }
            }

            result.items.push.apply(result.items, items);

            // calculate preset price
            for (let it of items)
            {
                rub += HandbookController.getTemplatePrice(it._tpl);
            }

            result.barter_scheme[items[0]._id] = assort.barter_scheme[itemID];
            result.barter_scheme[items[0]._id][0][0].count = rub;
            result.loyal_level_items[items[0]._id] = assort.loyal_level_items[itemID];
        }

        return result;
    }

    // delete assort keys
    static removeItemFromAssort(assort, itemID)
    {
        let ids_toremove = ItemHelper.findAndReturnChildrenByItems(assort.items, itemID);

        delete assort.barter_scheme[itemID];
        delete assort.loyal_level_items[itemID];

        for (let i in ids_toremove)
        {
            for (let a in assort.items)
            {
                if (assort.items[a]._id === ids_toremove[i])
                {
                    assort.items.splice(a, 1);
                }
            }
        }

        return assort;
    }

    static getPurchasesData(traderID, sessionID)
    {
        let pmcData = ProfileController.getPmcProfile(sessionID);
        let trader = DatabaseServer.tables.traders[traderID].base;
        let currency = PlzRefactorMeHelper.getCurrency(trader.currency);
        let output = {};

        // get sellable items
        for (let item of pmcData.Inventory.items)
        {
            let price = 0;

            if (item._id === pmcData.Inventory.equipment
            || item._id === pmcData.Inventory.stash
            || item._id === pmcData.Inventory.questRaidItems
            || item._id === pmcData.Inventory.questStashItems
            || ItemHelper.isNotSellable(item._tpl)
            || TraderController.traderFilter(trader.sell_category, item._tpl) === false)
            {
                continue;
            }

            // find all child of the item (including itself) and sum the price
            for (let childItem of ItemHelper.findAndReturnChildrenAsItems(pmcData.Inventory.items, item._id))
            {
                let tempPrice = DatabaseServer.tables.templates.handbook.Items.find((i) =>
                {
                    return childItem._tpl === i.Id;
                }).Price || 1;
                let count = ("upd" in childItem && "StackObjectsCount" in childItem.upd) ? childItem.upd.StackObjectsCount : 1;
                price = price + (tempPrice * count);
            }

            // dogtag calculation
            if ("upd" in item && "Dogtag" in item.upd && ItemHelper.isDogtag(item._tpl))
            {
                price *= item.upd.Dogtag.Level;
            }

            // meds & repairable calculation
            price *= ItemHelper.getItemQualityPrice(item);

            // get real price
            if (trader.discount > 0)
            {
                price -= (trader.discount / 100) * price;
            }
            price = PlzRefactorMeHelper.fromRUB(price, currency);
            price = (price > 0) ? price : 1;

            output[item._id] = [[{ "_tpl": currency, "count": price.toFixed(0) }]];
        }

        return output;
    }

    /*
        check if an item is allowed to be sold to a trader
        input : array of allowed categories, itemTpl of inventory
        output : boolean
    */
    static traderFilter(traderFilters, tplToCheck)
    {

        for (let filter of traderFilters)
        {
            for (let iaaaaa of HandbookController.templatesWithParent(filter))
            {
                if (iaaaaa === tplToCheck)
                {
                    return true;
                }
            }

            for (let subcateg of HandbookController.childrenCategories(filter))
            {
                for (let itemFromSubcateg of HandbookController.templatesWithParent(subcateg))
                {
                    if (itemFromSubcateg === tplToCheck)
                    {
                        return true;
                    }
                }
            }
        }

        return false;
    }
}

module.exports = TraderController;
