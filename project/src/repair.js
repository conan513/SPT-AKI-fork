"use strict";

class RepairController
{
    repair(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
        let trader = trader_f.traderServer.getTrader(body.tid, sessionID);
        let repairRate = (trader.repair.price_rate === 0) ? 1 : (trader.repair.price_rate / 100 + 1);

        // find the item to repair
        for (let repairItem of body.repairItems)
        {
            let itemToRepair = undefined;

            for (let item of pmcData.Inventory.items)
            {
                if (item._id === repairItem._id)
                {
                    itemToRepair = item;
                    break;
                }
            }

            if (itemToRepair === undefined)
            {
                continue;
            }

            // get repair price and pay the money
            let repairCost = Math.round((database_f.database.tables.templates.items[itemToRepair._tpl]._props.RepairCost * repairItem.count * repairRate) * gameplayConfig.trading.repairMultiplier);

            if (!itm_hf.payMoney(pmcData, {"scheme_items": [{"id": repairItem._id, "count": Math.round(repairCost)}], "tid": body.tid}, sessionID))
            {
                logger.logError("no money found");
                return "";
            }

            // change item durability
            let calculateDurability = itemToRepair.upd.Repairable.Durability + repairItem.count;

            if (itemToRepair.upd.Repairable.MaxDurability <= calculateDurability)
            {
                calculateDurability = itemToRepair.upd.Repairable.MaxDurability;
            }

            itemToRepair.upd.Repairable.Durability = calculateDurability;
            itemToRepair.upd.Repairable.MaxDurability = calculateDurability;

            //repairing mask cracks
            if ("FaceShield" in itemToRepair.upd && itemToRepair.upd.FaceShield.Hits > 0)
            {
                itemToRepair.upd.FaceShield.Hits = 0;
            }

            output.items.change.push(itemToRepair);
        }

        return output;
    }
}

class RepairCallbacks
{
    constructor()
    {
        item_f.itemServer.addRoute("Repair", this.repair.bind());
    }

    repair(pmcData, body, sessionID)
    {
        return repair_f.repairController.repair(pmcData, body, sessionID);
    }
}

module.exports.repairController = new RepairController();
module.exports.repairCallbacks = new RepairCallbacks();