/* trader.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

/* controller class maintains list of traders for each sessionID in memory. */
class Controller
{
    constructor()
    {
        database_f.database.tables.traders = {};
    }

    getTrader(traderID, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let trader = database_f.database.tables.traders[traderID].base;

        if (!(traderID in pmcData.TraderStandings))
        {
            this.resetTrader(sessionID, traderID);
        }

        trader.display = pmcData.TraderStandings[traderID].display;
        trader.loyalty.currentLevel = pmcData.TraderStandings[traderID].currentLevel;
        trader.loyalty.currentStanding = pmcData.TraderStandings[traderID].currentStanding;
        trader.loyalty.currentSalesSum = pmcData.TraderStandings[traderID].currentSalesSum;

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

        for (let traderID in database_f.database.tables.traders)
        {
            if (traderID === "ragfair")
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
        let loyaltyLevels = database_f.database.tables.traders[traderID].base.loyalty.loyaltyLevels;

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
        database_f.database.tables.traders[traderID].base.loyalty.currentLevel = targetLevel;
    }

    resetTrader(sessionID, traderID)
    {
        let account = account_f.server.find(sessionID);
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        let traderWipe = json.parse(json.read(db.profile[account.edition]["trader_" + pmcData.Info.Side.toLowerCase()]));

        pmcData.TraderStandings[traderID] = {
            "currentLevel": 1,
            "currentSalesSum": traderWipe.initialSalesSum,
            "currentStanding": traderWipe.initialStanding,
            "NextLoyalty": null,
            "loyaltyLevels": database_f.database.tables.traders[traderID].base.loyalty.loyaltyLevels,
            "display": database_f.database.tables.traders[traderID].base.display
        };

        this.lvlUp(traderID, sessionID);
    }

    updateTraders(sessionID)
    {
        // update each hour
        const update_per = 3600;
        const timeNow = Math.floor(Date.now() / 1000);
        let tradersToUpdateList = trader_f.controller.getAllTraders(sessionID);

        dialogue_f.controller.removeExpiredItems(sessionID);

        for (let i = 0; i < tradersToUpdateList.length; i++)
        {
            if ((tradersToUpdateList[i].supply_next_time + update_per) > timeNow)
            {
                continue;
            }

            // update restock timer
            const substracted_time = timeNow - tradersToUpdateList[i].supply_next_time;
            const days_passed = Math.floor((substracted_time) / 86400);
            const time_co_compensate = days_passed * 86400;
            let newTraderTime = tradersToUpdateList[i].supply_next_time + time_co_compensate;
            const compensateUpdate_per = (Math.floor((timeNow - newTraderTime) / update_per)) * update_per;

            newTraderTime = newTraderTime + compensateUpdate_per + update_per;
            tradersToUpdateList[i].supply_next_time = newTraderTime;
        }
    }

    getAssort(sessionID, traderID)
    {

        if (traderID === "579dc571d53a0658a154fbec")
        {
            logger.logWarning("generating fence");
            this.generateFenceAssort();
        }

        const pmcData = profile_f.controller.getPmcProfile(sessionID);
        let assorts = JSON.parse(JSON.stringify(database_f.database.tables.traders[traderID].assort));

        // strip quest assorts
        if (traderID !== "ragfair")
        {
            // 1 is min level, 4 is max level
            let level = pmcData.TraderStandings[traderID].currentLevel;
            let questassort = database_f.database.tables.traders[traderID].questassort;

            for (let key in assorts.loyal_level_items)
            {
                if (assorts.loyal_level_items[key] > level)
                {
                    assorts = this.removeItemFromAssort(assorts, key);
                }
                else if (key in questassort.started && quest_f.controller.getQuestStatus(pmcData, questassort.started[key]) !== "Started")
                {
                    assorts = this.removeItemFromAssort(assorts, key);
                }
                else if (key in questassort.success && quest_f.controller.getQuestStatus(pmcData, questassort.success[key]) !== "Success")
                {
                    assorts = this.removeItemFromAssort(assorts, key);
                }
                else if (key in questassort.fail && quest_f.controller.getQuestStatus(pmcData, questassort.fail[key]) !== "Fail")
                {
                    assorts = this.removeItemFromAssort(assorts, key);
                }
            }
        }

        return assorts;
    }

    generateFenceAssort()
    {
        const fenceID = "579dc571d53a0658a154fbec";
        const assort = database_f.database.tables.traders[fenceID].assort;
        const names = Object.keys(assort.loyal_level_items);
        let base = {"items": [], "barter_scheme": {}, "loyal_level_items": {}};
        let added = [];
        for (let i = 0; i < trader_f.config.fenceAssortSize; i++)
        {
            let itemID = names[utility.getRandomInt(0, names.length - 1)];
            if (added.includes(itemID))
            {
                i--;
                continue;
            }
            added.push(itemID);
            //it's the item
            if (!(itemID in database_f.database.tables.globals.ItemPresets))
            {
                base.items.push(assort.items[assort.items.findIndex(i => i._id === itemID)]);
                base.barter_scheme[itemID] = assort.barter_scheme[itemID];
                base.loyal_level_items[itemID] = assort.loyal_level_items[itemID];
                continue;
            }

            //it's itemPreset
            let rub = 0;
            let items = JSON.parse(JSON.stringify(database_f.database.tables.globals.ItemPresets[itemID]._items));
            let ItemRootOldId = database_f.database.tables.globals.ItemPresets[itemID]._parent;

            for (let i = 0; i < items.length; i++)
            {
                let mod = items[i];

                //build root Item info
                if (!("parentId" in mod))
                {
                    mod._id = itemID;
                    mod.parentId = "hideout";
                    mod.slotId = "hideout";
                    mod.upd = {
                        "UnlimitedCount": true,
                        "StackObjectsCount": 999999999
                    };
                }
                else if (mod.parentId === ItemRootOldId)
                {
                    mod.parentId = itemID;
                }
            }

            base.items.push.apply(base.items, items);

            //calculate preset price
            for (let it of items)
            {
                rub += helpfunc_f.helpFunctions.getTemplatePrice(it._tpl);
            }

            base.barter_scheme[itemID] = assort.barter_scheme[itemID];
            base.barter_scheme[itemID][0][0].count = rub;
            base.loyal_level_items[itemID] = assort.loyal_level_items[itemID];
        }

        database_f.database.tables.traders[fenceID].assort = base;
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
        let trader = database_f.database.tables.traders[traderID].base;
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
            || traderFilter(trader.sell_category, item._tpl) === false)
            {
                continue;
            }

            // find all child of the item (including itself) and sum the price
            for (let childItem of helpfunc_f.helpFunctions.findAndReturnChildrenAsItems(pmcData.Inventory.items, item._id))
            {
                let tempPrice = (database_f.database.tables.templates.items[childItem._tpl]._props.CreditsPrice >= 1) ? database_f.database.tables.templates.items[childItem._tpl]._props.CreditsPrice : 1;
                let count = ("upd" in childItem && "StackObjectsCount" in childItem.upd) ? childItem.upd.StackObjectsCount : 1;
                price = price + (tempPrice * count);
            }

            // dogtag calculation
            if ("upd" in item && "Dogtag" in item.upd && helpfunc_f.helpFunctions.isDogtag(item._tpl))
            {
                price *= item.upd.Dogtag.Level;
            }

            // meds calculation
            let hpresource = ("upd" in item && "MedKit" in item.upd) ? item.upd.MedKit.HpResource : 0;

            if (hpresource > 0)
            {
                let maxHp = helpfunc_f.helpFunctions.getItem(item._tpl)[1]._props.MaxHpResource;
                price *= (hpresource / maxHp);
            }

            // weapons and armor calculation
            let repairable = ("upd" in item && "Repairable" in item.upd) ? item.upd.Repairable : 1;

            if (repairable !== 1)
            {
                price *= (repairable.Durability / repairable.MaxDurability);
            }

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
}

/*
check if an item is allowed to be sold to a trader
input : array of allowed categories, itemTpl of inventory
output : boolean
*/
function traderFilter(traderFilters, tplToCheck)
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

class Callbacks
{
    constructor()
    {
        router_f.router.addStaticRoute("/client/trading/api/getTradersList", this.getTraderList.bind());
        router_f.router.addDynamicRoute("/client/trading/api/getUserAssortPrice/trader/", this.getProfilePurchases.bind());
        router_f.router.addDynamicRoute("/client/trading/api/getTrader/", this.getTrader.bind());
        router_f.router.addDynamicRoute("/client/trading/api/getTraderAssort/", this.getAssort.bind());
    }

    getTraderList(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getAllTraders(sessionID));
    }

    getProfilePurchases(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getPurchasesData(url.substr(url.lastIndexOf("/") + 1), sessionID));
    }

    getTrader(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getTrader(url.replace("/client/trading/api/getTrader/", ""), sessionID));
    }

    getAssort(url, info, sessionID)
    {
        return response_f.controller.getBody(trader_f.controller.getAssort(sessionID, url.replace("/client/trading/api/getTraderAssort/", "")));
    }
}

class Config
{
    constructor()
    {
        this.fenceAssortSize = 60;
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
