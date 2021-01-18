/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Ereshkigal
 */

"use strict";

class TraderController
{
    constructor()
    {
        database_f.server.tables.traders = {};
        this.fenceAssort = undefined;
    }

    load()
    {
        this.updateTraders();
    }

    getTrader(traderID, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let trader = database_f.server.tables.traders[traderID].base;

        if (!(traderID in pmcData.TraderStandings))
        {
            profile_f.controller.resetTrader(sessionID, traderID);
            this.lvlUp(traderID, sessionID);
        }

        trader.loyalty.currentLevel = pmcData.TraderStandings[traderID].currentLevel;
        trader.loyalty.currentStanding = pmcData.TraderStandings[traderID].currentStanding.toFixed(3);
        trader.loyalty.currentSalesSum = pmcData.TraderStandings[traderID].currentSalesSum;
        trader.display = pmcData.TraderStandings[traderID].display;

        return trader;
    }

    changeTraderDisplay(traderID, status, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        pmcData.TraderStandings[traderID].display = status;
    }

    getAllTraders(sessionID)
    {
        let traders = [];

        for (let traderID in database_f.server.tables.traders)
        {
            if (!database_f.server.tables.traders[traderID].base.working)
            {
                continue;
            }

            traders.push(this.getTrader(traderID, sessionID));
        }

        return traders;
    }

    lvlUp(traderID, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let loyaltyLevels = database_f.server.tables.traders[traderID].base.loyalty.loyaltyLevels;

        // level up player
        pmcData.Info.Level = helpfunc_f.helpFunctions.calculateLevel(pmcData);

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
        database_f.server.tables.traders[traderID].base.loyalty.currentLevel = targetLevel;
    }

    updateTraders()
    {
        const time = common_f.time.getTimestamp();
        const update = trader_f.config.updateTime;

        for (const traderID in database_f.server.tables.traders)
        {
            const trader = database_f.server.tables.traders[traderID].base;

            if (trader.supply_next_time > time)
            {
                continue;
            }

            // get resupply time
            const overdue = (time - trader.supply_next_time);
            const refresh = Math.floor(overdue / update) + 1;

            trader.supply_next_time = trader.supply_next_time + refresh * update;
            database_f.server.tables.traders[traderID].base = trader;
        }

        return true;
    }

    getAssort(sessionID, traderID)
    {
        if (traderID === "579dc571d53a0658a154fbec")
        {
            const time = common_f.time.getTimestamp();
            const trader = database_f.server.tables.traders[traderID].base;

            if (!this.fenceAssort || trader.supply_next_time < time)
            {
                common_f.logger.logWarning("generating fence");
                this.fenceAssort = this.generateFenceAssort();
                ragfair_f.server.generateTraderOffers(traderID);
            }
            
            return this.fenceAssort;
        }

        const pmcData = profile_f.controller.getPmcProfile(sessionID);
        const traderData = common_f.json.clone(database_f.server.tables.traders[traderID]);
        let result = traderData.assort;

        // strip items (1 is min level, 4 is max level)
        for (const itemID in result.loyal_level_items)
        {
            if (result.loyal_level_items[itemID] > pmcData.TraderStandings[traderID].currentLevel)
            {
                result = this.removeItemFromAssort(result, itemID);
            }
        }

        // strip quest result
        if ("questassort" in traderData)
        {
            const questassort = database_f.server.tables.traders[traderID].questassort;

            for (const itemID in result.loyal_level_items)
            {
                if (itemID in questassort.started && quest_f.controller.questStatus(pmcData, questassort.started[itemID]) !== "Started")
                {
                    result = this.removeItemFromAssort(result, itemID);
                }

                if (itemID in questassort.success && quest_f.controller.questStatus(pmcData, questassort.success[itemID]) !== "Success")
                {
                    result = this.removeItemFromAssort(result, itemID);
                }

                if (itemID in questassort.fail && quest_f.controller.questStatus(pmcData, questassort.fail[itemID]) !== "Fail")
                {
                    result = this.removeItemFromAssort(result, itemID);
                }
            }
        }

        return result;
    }

    generateFenceAssort()
    {
        const fenceID = "579dc571d53a0658a154fbec";
        const assort = database_f.server.tables.traders[fenceID].assort;
        const itemPresets = database_f.server.tables.globals.ItemPresets;
        const names = Object.keys(assort.loyal_level_items);
        let result = {
            "items": [],
            "barter_scheme": {},
            "loyal_level_items": {}
        };

        for (let i = 0; i < trader_f.config.fenceAssortSize; i++)
        {
            let itemID = names[common_f.random.getInt(0, names.length - 1)];
            let price = helpfunc_f.helpFunctions.getTemplatePrice(itemID);

            if (price === 0 || price === 1 || price === 100)
            {
                // don't allow "special" items
                i--;
                continue;
            }

            // it's the item
            if (!(itemID in itemPresets))
            {
                const toPush = common_f.json.clone(assort.items[assort.items.findIndex(i => i._id === itemID)]);
                toPush._id = common_f.hash.generate();
                result.items.push(toPush);
                result.barter_scheme[toPush._id] = assort.barter_scheme[itemID];
                result.loyal_level_items[toPush._id] = assort.loyal_level_items[itemID];
                continue;
            }

            // it's itemPreset
            let rub = 0;
            let items = common_f.json.clone(itemPresets[itemID]._items);
            let ItemRootOldId = itemPresets[itemID]._parent;

            items[0]._id = common_f.hash.generate();

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
                rub += helpfunc_f.helpFunctions.getTemplatePrice(it._tpl);
            }

            result.barter_scheme[items[0]._id] = assort.barter_scheme[itemID];
            result.barter_scheme[items[0]._id][0][0].count = rub;
            result.loyal_level_items[items[0]._id] = assort.loyal_level_items[itemID];
        }

        return result;
    }

    // delete assort keys
    removeItemFromAssort(assort, itemID)
    {
        let ids_toremove = helpfunc_f.helpFunctions.findAndReturnChildrenByItems(assort.items, itemID);

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

    getPurchasesData(traderID, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let trader = database_f.server.tables.traders[traderID].base;
        let currency = helpfunc_f.helpFunctions.getCurrency(trader.currency);
        let output = {};

        // get sellable items
        for (let item of pmcData.Inventory.items)
        {
            let price = 0;

            if (item._id === pmcData.Inventory.equipment
            || item._id === pmcData.Inventory.stash
            || item._id === pmcData.Inventory.questRaidItems
            || item._id === pmcData.Inventory.questStashItems
            || helpfunc_f.helpFunctions.isNotSellable(item._tpl)
            || this.traderFilter(trader.sell_category, item._tpl) === false)
            {
                continue;
            }

            // find all child of the item (including itself) and sum the price
            for (let childItem of helpfunc_f.helpFunctions.findAndReturnChildrenAsItems(pmcData.Inventory.items, item._id))
            {
                let tempPrice = (database_f.server.tables.templates.items[childItem._tpl]._props.CreditsPrice >= 1) ? database_f.server.tables.templates.items[childItem._tpl]._props.CreditsPrice : 1;
                let count = ("upd" in childItem && "StackObjectsCount" in childItem.upd) ? childItem.upd.StackObjectsCount : 1;
                price = price + (tempPrice * count);
            }

            // dogtag calculation
            if ("upd" in item && "Dogtag" in item.upd && helpfunc_f.helpFunctions.isDogtag(item._tpl))
            {
                price *= item.upd.Dogtag.Level;
            }

            // meds & repairable calculation
            price *= helpfunc_f.helpFunctions.getItemQualityPrice(item);

            // get real price
            if (trader.discount > 0)
            {
                price -= (trader.discount / 100) * price;
            }
            price = helpfunc_f.helpFunctions.fromRUB(price, currency);
            price = (price > 0 && price !== "NaN") ? price : 1;

            output[item._id] = [[{ "_tpl": currency, "count": price.toFixed(0) }]];
        }

        return output;
    }

    /*
        check if an item is allowed to be sold to a trader
        input : array of allowed categories, itemTpl of inventory
        output : boolean
    */
    traderFilter(traderFilters, tplToCheck)
    {

        for (let filter of traderFilters)
        {
            for (let iaaaaa of helpfunc_f.helpFunctions.templatesWithParent(filter))
            {
                if (iaaaaa === tplToCheck)
                {
                    return true;
                }
            }

            for (let subcateg of helpfunc_f.helpFunctions.childrenCategories(filter))
            {
                for (let itemFromSubcateg of helpfunc_f.helpFunctions.templatesWithParent(subcateg))
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

module.exports = new TraderController();
